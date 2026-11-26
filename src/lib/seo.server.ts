import type { Metadata } from "next";
import { cache } from "react";
import { dbConnect } from "@/lib/mongodb";
import { Faq, SeoLink, SeoPage, SiteSetting } from "@/models";
import { pageMeta } from "@/lib/seo";

type PageMetaInput = Parameters<typeof pageMeta>[0];
type SeoPageDoc = { TITLE?: string; DESCRIPTION?: string; KEYWORDS?: string; OG_IMAGE?: string; NOINDEX?: string };

/** Admin overrides for one URL path (Admin → SEO → Page SEO). Never throws: SEO must not break a page. */
export const getSeoOverride = cache(async (path: string): Promise<SeoPageDoc | null> => {
  try {
    await dbConnect();
    return (await SeoPage.findOne({ PATH: path }).lean()) as SeoPageDoc | null;
  } catch {
    return null;
  }
});

/** pageMeta() + whatever the admin set for this path (blank fields keep the code default). */
export async function seoMeta(input: PageMetaInput): Promise<Metadata> {
  const o = await getSeoOverride(input.path);
  const meta = pageMeta({
    ...input,
    title: o?.TITLE?.trim() || input.title,
    description: o?.DESCRIPTION?.trim() || input.description,
    image: o?.OG_IMAGE?.trim() || input.image,
  });
  if (o?.KEYWORDS?.trim()) meta.keywords = o.KEYWORDS.split(",").map((k) => k.trim()).filter(Boolean);
  if (o?.NOINDEX === "Y") meta.robots = { index: false, follow: true };
  return meta;
}

export type FooterLinkGroup = { group: string; links: { label: string; url: string }[] };

/** Active footer keyword links grouped by column heading, in admin order. */
export const getFooterLinks = cache(async (): Promise<FooterLinkGroup[]> => {
  try {
    await dbConnect();
    const rows = (await SeoLink.find({ IS_ACTIVE: { $ne: "N" } })
      .sort({ GROUP: 1, ORDER: 1, LABEL: 1 })
      .lean()) as unknown as { LABEL: string; URL: string; GROUP?: string }[];
    const groups = new Map<string, FooterLinkGroup>();
    for (const r of rows) {
      const g = r.GROUP?.trim() || "Popular Searches";
      if (!groups.has(g)) groups.set(g, { group: g, links: [] });
      groups.get(g)!.links.push({ label: r.LABEL, url: r.URL });
    }
    return [...groups.values()];
  } catch {
    return [];
  }
});

export type FaqItem = { question: string; answer: string };

/** FAQs for a page (its own + "*" site-wide ones), admin order. */
export async function getFaqs(path: string): Promise<FaqItem[]> {
  try {
    await dbConnect();
    const rows = (await Faq.find({ IS_ACTIVE: { $ne: "N" }, PAGE_PATH: { $in: [path, "*"] } })
      .sort({ ORDER: 1, createdAt: 1 })
      .lean()) as unknown as { QUESTION: string; ANSWER: string }[];
    return rows.map((r) => ({ question: r.QUESTION, answer: r.ANSWER }));
  } catch {
    return [];
  }
}

/** Plain-language company summary written in admin (used by llms.txt / AI answers). */
export async function getSiteSummary(): Promise<string> {
  try {
    await dbConnect();
    const s = (await SiteSetting.findOne({ KEY: "site" }).lean()) as { SITE_SUMMARY?: string } | null;
    return s?.SITE_SUMMARY?.trim() || "";
  } catch {
    return "";
  }
}
