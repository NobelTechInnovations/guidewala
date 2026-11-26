import { dbConnect } from "@/lib/mongodb";
import { BlogPost, CityMaster, Faq, PackageTitleMaster } from "@/models";
import { durationLabel, htmlToText } from "@/lib/packages";
import { ensurePackageSlugs } from "@/lib/packageSlugs";
import { getSiteSummary } from "@/lib/seo.server";
import { SITE_PHONE, SITE_URL, SOCIAL_LINKS } from "@/lib/site";

/**
 * /llms.txt — a plain-text map of the site for AI assistants (GEO). Built from
 * the database on each request, so new packages, guide services, posts and FAQs
 * appear automatically. The intro comes from Admin → SEO → AI / GEO Summary.
 */
export const dynamic = "force-dynamic";

const DEFAULT_SUMMARY =
  "Guidewala (G8 Guidewala Services LLP, Jaipur) connects travellers with government-approved, licensed local tour guides across India — Jaipur, Agra, Delhi, Udaipur, Jodhpur, Jaisalmer and more — and arranges taxis, hotels and multi-day tour packages such as Dekho Rajasthan.";

type Pkg = { TITLE_NAME?: string; SLUG?: string; CITY_ID?: string; PKG_AMOUNT?: number; PKG_TYPE?: string; DURATION_DAYS?: number; DURATION_NIGHTS?: number; PKG_DESC?: string };

export async function GET() {
  await dbConnect();
  await ensurePackageSlugs();
  const [summary, packages, cities, posts, faqs] = await Promise.all([
    getSiteSummary(),
    PackageTitleMaster.find({ IS_ACTIVE: "Y" }).sort({ PKG_AMOUNT: -1 }).lean() as unknown as Promise<Pkg[]>,
    CityMaster.find({}).select("CITY_ID CITY_NAME -_id").lean() as unknown as Promise<{ CITY_ID: string; CITY_NAME: string }[]>,
    BlogPost.find({ IS_PUBLISHED: true }).sort({ PUBLISHED_ON: -1 }).limit(30).select("TITLE SLUG EXCERPT -_id").lean() as unknown as Promise<
      { TITLE: string; SLUG: string; EXCERPT?: string }[]
    >,
    Faq.find({ IS_ACTIVE: { $ne: "N" } }).sort({ ORDER: 1 }).lean() as unknown as Promise<{ QUESTION: string; ANSWER: string }[]>,
  ]);
  const city = new Map(cities.map((c) => [c.CITY_ID, c.CITY_NAME]));
  const line = (p: Pkg) => {
    const bits = [city.get(p.CITY_ID || ""), durationLabel(p.DURATION_DAYS, p.DURATION_NIGHTS), p.PKG_AMOUNT ? `from ₹${p.PKG_AMOUNT.toLocaleString("en-IN")}` : ""].filter(Boolean);
    const desc = htmlToText(p.PKG_DESC || "").replace(/\s+/g, " ").slice(0, 160);
    return `- [${p.TITLE_NAME}](${SITE_URL}/packages/${p.SLUG}): ${bits.join(", ")}${desc ? ` — ${desc}` : ""}`;
  };
  const tours = packages.filter((p) => p.PKG_TYPE !== "guide" && p.SLUG);
  const guides = packages.filter((p) => p.PKG_TYPE === "guide" && p.SLUG);

  const out = [
    "# Guidewala",
    "",
    `> ${summary || DEFAULT_SUMMARY}`,
    "",
    `Website: ${SITE_URL} · Phone/WhatsApp: ${SITE_PHONE} · Email: booking@guidewala.co.in`,
    `Social: ${Object.values(SOCIAL_LINKS).join(" · ")}`,
    "",
    "## Main pages",
    `- [Book a tour guide](${SITE_URL}/book-guide): government-approved local guides by city`,
    `- [Tour packages](${SITE_URL}/tour-packages): multi-day guided tours`,
    `- [Taxi service](${SITE_URL}/taxi-service): taxi enquiries anywhere in India`,
    `- [Hotel booking](${SITE_URL}/hotel-booking): hotel enquiries from budget to heritage`,
    `- [Guide registration](${SITE_URL}/guide-registration): for licensed guides to join`,
    `- [About](${SITE_URL}/about-us) · [Contact](${SITE_URL}/contact-us) · [Blog](${SITE_URL}/blog)`,
    `- [Cancellation & refunds](${SITE_URL}/terms-and-conditions): 30% of the booking amount is non-refundable if cancelled after confirmation`,
    ...(tours.length ? ["", "## Tour packages", ...tours.map(line)] : []),
    ...(guides.length ? ["", "## Guide services", ...guides.map(line)] : []),
    ...(posts.length ? ["", "## Blog", ...posts.map((p) => `- [${p.TITLE}](${SITE_URL}/blog/${p.SLUG})${p.EXCERPT ? `: ${p.EXCERPT}` : ""}`)] : []),
    ...(faqs.length ? ["", "## FAQ", ...faqs.flatMap((f) => [`### ${f.QUESTION}`, f.ANSWER.trim(), ""])] : []),
    "",
  ].join("\n");

  return new Response(out, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
