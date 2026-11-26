import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { FaShieldAlt, FaWallet } from "react-icons/fa";
import GuideBookingForm from "@/components/booking/GuideBookingForm";
import Gallery from "@/components/package/Gallery";
import InfoTabs, { type InfoTab } from "@/components/package/InfoTabs";
import ItineraryDays, { type DayView } from "@/components/package/ItineraryDays";
import NeedToKnow from "@/components/package/NeedToKnow";
import PlacesGrid, { type PlaceView } from "@/components/package/PlacesGrid";
import PriceCard, { MobileBookBar } from "@/components/package/PriceCard";
import RelatedPackages from "@/components/package/RelatedPackages";
import RichText from "@/components/package/RichText";
import SectionNav, { type NavSection } from "@/components/package/SectionNav";
import TourHeader from "@/components/package/TourHeader";
import TourIncludes from "@/components/package/TourIncludes";
import { dbConnect } from "@/lib/mongodb";
import { ensurePackageSlugs, packageHref } from "@/lib/packageSlugs";
import { absUrl, jsonLd, titleCase, truncate } from "@/lib/seo";
import { existingMediaPath } from "@/lib/media.server";
import {
  SHOWN,
  durationLabel,
  hasDayNo,
  htmlToText,
  isDayWise,
  sortItinerary,
  type ItineraryDoc,
  type PackageDoc,
  typeFilter,
} from "@/lib/packages";
import { cancellationPolicyFor, policySummary } from "@/lib/policies";
import { PackageTitleMaster, PackageDescDetails, CityMaster, HotelMaster } from "@/models";
import { seoMeta } from "@/lib/seo.server";
import FaqSection from "@/components/FaqSection";

/** Tour Information fallback for packages with no inclusions/exclusions of their own (all legacy ones). */
const UNIVERSAL_INCLUSIONS = [
  "Government-approved, verified guide",
  "Monument entry fee assistance",
  "Local history & storytelling",
  "Transparent, upfront pricing",
];

function whatsappHref(title: string, pkgId: number): string {
  const text = `Hi, I'd like to enquire about ${title} (Package #${pkgId}).`;
  return `https://api.whatsapp.com/send/?phone=919829185267&text=${encodeURIComponent(text)}`;
}

/** Everything the page shows. `cache` lets generateMetadata and the page share one lookup per request. */
const getPackage = cache(async (slug: string) => {
  await dbConnect();
  // Old numeric URLs (/packages/19) permanently redirect to the slug URL.
  if (/^\d+$/.test(slug)) {
    const byId = (await PackageTitleMaster.findOne({ PKG_ID: Number(slug), IS_ACTIVE: "Y" }).select("PKG_ID SLUG -_id").lean()) as
      | { PKG_ID: number; SLUG?: string }
      | null;
    if (!byId) return null;
    if (!byId.SLUG) await ensurePackageSlugs();
    const fresh = (await PackageTitleMaster.findOne({ PKG_ID: byId.PKG_ID }).select("SLUG -_id").lean()) as { SLUG?: string } | null;
    if (fresh?.SLUG) permanentRedirect(`/packages/${fresh.SLUG}`);
    return null;
  }
  const pkg = (await PackageTitleMaster.findOne({ SLUG: slug, IS_ACTIVE: "Y" }).lean()) as unknown as PackageDoc | null;
  if (!pkg) return null;
  const pkgId = pkg.PKG_ID;

  const [city, itinerary, hotels, related] = await Promise.all([
    CityMaster.findOne({ CITY_ID: pkg.CITY_ID }).lean() as unknown as { CITY_NAME: string } | null,
    // Hidden itinerary items (IS_ACTIVE "N") never reach the page.
    PackageDescDetails.find({ PKG_ID: pkgId, IS_ACTIVE: SHOWN }).lean() as unknown as ItineraryDoc[],
    HotelMaster.find({ CITY_ID: pkg.CITY_ID, IS_ACTIVE: "Y" }).lean() as unknown as { HOTEL_NAME: string }[],
    PackageTitleMaster.find({ CITY_ID: pkg.CITY_ID, IS_ACTIVE: "Y", PKG_ID: { $ne: pkgId }, ...typeFilter(pkg.PKG_TYPE === "guide" ? "guide" : "tour") })
      .limit(3)
      .lean() as unknown as PackageDoc[],
  ]);

  return {
    pkg,
    cityName: city?.CITY_NAME || "",
    itinerary: sortItinerary(itinerary),
    hotels: hotels.map((h) => h.HOTEL_NAME),
    related,
  };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPackage(slug);
  if (!data) return { title: "Package not found | Guidewala", robots: { index: false } };
  const { pkg, cityName } = data;
  return seoMeta({
    title: packageSeoTitle(pkg),
    description: packageSeoDescription(pkg, cityName),
    path: `/packages/${pkg.SLUG}`,
    image: existingMediaPath("pkgTitleImg", pkg.PKG_IMAGE),
  });
}

/** `${Title Case name} ${days} Days | Guidewala`, at most 60 chars. */
function packageSeoTitle(pkg: PackageDoc): string {
  const suffix = " | Guidewala";
  const days = pkg.DURATION_DAYS && !/\bdays?\b/i.test(pkg.TITLE_NAME || "") ? ` ${pkg.DURATION_DAYS} Days` : "";
  return truncate(`${titleCase(pkg.TITLE_NAME || "Tour Package")}${days}`, 60 - suffix.length) + suffix;
}

/** ~140–155 chars: destination, duration, "licensed guide" and starting price. */
function packageSeoDescription(pkg: PackageDoc, cityName: string): string {
  const name = titleCase(pkg.TITLE_NAME || "this tour");
  const where = cityName && !name.toLowerCase().includes(cityName.toLowerCase()) ? ` in ${cityName}` : "";
  const duration = durationLabel(pkg.DURATION_DAYS, pkg.DURATION_NIGHTS);
  const price = pkg.PKG_AMOUNT ? ` from ₹${pkg.PKG_AMOUNT.toLocaleString("en-IN")}` : "";
  const text = `Book ${name}${where}${duration ? ` (${duration})` : ""} with a licensed guide${price}. Verified guides, clear pricing and easy booking with Guidewala.`;
  return truncate(text, 155);
}

/** A page section that the sticky nav can jump to (scroll margin clears header + nav). */
function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-40">
      <h2 id={`${id}-title`} className="mb-5 font-display text-2xl font-semibold text-slate-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function PackageDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPackage(slug);
  if (!data) notFound();

  const { pkg, cityName, itinerary, hotels, related } = data;
  const title = titleCase(pkg.TITLE_NAME ?? "");
  const amount = pkg.PKG_AMOUNT ?? 0;
  const priceNote = pkg.PRICE_NOTE?.trim() || "per person";
  const policy = cancellationPolicyFor(pkg);

  // Only files that exist on disk, cover first — a missing file never becomes a broken <img>.
  const gallery = [
    existingMediaPath("pkgTitleImg", pkg.PKG_IMAGE),
    ...(pkg.GALLERY ?? []).map((file) => existingMediaPath("pkgGallery", file)),
  ].filter((src): src is string => src !== null);

  // Day-wise as soon as any shown item has a day; undayed items then follow as "Also included".
  const dayWise = isDayWise(itinerary);
  const days: DayView[] = itinerary
    .filter((item) => dayWise && hasDayNo(item.DAY_NO))
    .map((item) => ({
      id: item.ID,
      dayNo: item.DAY_NO as number,
      title: item.ITINERARY ?? "",
      desc: item.PACKAGE_DESC,
      meals: item.MEALS ?? [],
      stay: item.STAY?.trim() || undefined,
      image: existingMediaPath("pkgItinImg", item.PKG_IMAGE),
    }));
  const places: PlaceView[] = itinerary
    .filter((item) => !dayWise || !hasDayNo(item.DAY_NO))
    .map((item) => ({
      id: item.ID,
      title: item.ITINERARY ?? "",
      desc: item.PACKAGE_DESC,
      image: existingMediaPath("pkgItinImg", item.PKG_IMAGE),
    }));

  const includes = pkg.INCLUDES ?? [];
  const highlights = pkg.HIGHLIGHTS ?? [];
  const inclusions = pkg.INCLUSIONS ?? [];
  const exclusions = pkg.EXCLUSIONS ?? [];
  const infoTabs: InfoTab[] =
    inclusions.length > 0 || exclusions.length > 0
      ? [
          ...(inclusions.length > 0 ? [{ id: "inclusions", label: "Inclusions", items: inclusions, kind: "include" as const }] : []),
          ...(exclusions.length > 0 ? [{ id: "exclusions", label: "Exclusions", items: exclusions, kind: "exclude" as const }] : []),
        ]
      : [{ id: "included", label: "What's included", items: UNIVERSAL_INCLUSIONS, kind: "include" }];

  const documents = pkg.DOCUMENTS ?? [];
  const thingsToCarry = pkg.THINGS_TO_CARRY ?? [];
  const notes = pkg.NOTES ?? [];
  const hasNeedToKnow = documents.length + thingsToCarry.length + notes.length > 0;
  const hasOverview = htmlToText(pkg.PKG_DESC) !== "";

  // Nav lists only sections that render (Tour Information and Cancellation always do).
  const sections: NavSection[] = [
    ...(itinerary.length > 0 ? [{ id: "itinerary", label: "Itinerary" }] : []),
    { id: "tour-information", label: "Tour Information" },
    ...(hasNeedToKnow ? [{ id: "need-to-know", label: "Need to Know" }] : []),
    { id: "cancellation", label: "Cancellation Policy" },
  ];

  // Structured data: the tour (with day-wise itinerary + offer) and its breadcrumb trail.
  const url = absUrl(`/packages/${pkg.SLUG}`);
  const isGuide = pkg.PKG_TYPE === "guide";
  const tripLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: title,
    description: htmlToText(pkg.PKG_DESC || "") || `${title}${cityName ? ` in ${cityName}` : ""} with a licensed Guidewala guide.`,
    url,
    ...(gallery[0] ? { image: gallery.map(absUrl) } : {}),
    touristType: pkg.TOUR_TYPE || (isGuide ? "Guided city tour" : "Sightseeing"),
    ...(itinerary.length
      ? {
          itinerary: {
            "@type": "ItemList",
            itemListElement: itinerary.map((item, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: (hasDayNo(item.DAY_NO) ? `Day ${item.DAY_NO}: ` : "") + (item.ITINERARY ?? ""),
            })),
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      price: amount,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url,
    },
    provider: { "@id": absUrl("/#organization") },
  };
  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
      isGuide
        ? { "@type": "ListItem", position: 2, name: "Book Guide", item: absUrl("/book-guide") }
        : { "@type": "ListItem", position: 2, name: "Tour Packages", item: absUrl("/tour-packages") },
      { "@type": "ListItem", position: 3, name: title, item: url },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(tripLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(crumbsLd)} />
      <div className="mx-auto max-w-7xl px-6 pt-6 pb-16">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link href="/" className="transition hover:text-gw-brand">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/book-guide" className="transition hover:text-gw-brand">
                Book Guide
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="min-w-0 font-medium text-slate-800">
              {title}
            </li>
          </ol>
        </nav>

        <Gallery images={gallery} title={title} />

        <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-3">
          {/* Title, overview, includes/highlights */}
          <div className="min-w-0 space-y-8 lg:col-span-2">
            <TourHeader
              title={title}
              cityName={cityName}
              tourType={pkg.TOUR_TYPE}
              duration={durationLabel(pkg.DURATION_DAYS, pkg.DURATION_NIGHTS)}
              route={pkg.ROUTE ?? []}
              itineraryLink={
                dayWise ? "View day-wise itinerary" : itinerary.length > 0 ? "See places you'll visit" : undefined
              }
            />

            {hasOverview && (
              <div>
                <h2 className="mb-3 font-display text-2xl font-semibold text-slate-900">Overview</h2>
                <RichText text={pkg.PKG_DESC} className="leading-relaxed text-slate-600" />
              </div>
            )}

            {(includes.length > 0 || highlights.length > 0) && (
              <TourIncludes includes={includes} highlights={highlights} />
            )}
          </div>

          {/* Price card: right column spanning both rows on desktop, under the title block on mobile. */}
          <aside className="min-w-0 lg:col-start-3 lg:row-span-2 lg:row-start-1">
            <div className="lg:sticky lg:top-24">
              <PriceCard
                amount={amount}
                priceNote={priceNote}
                whatsappHref={whatsappHref(title, pkg.PKG_ID)}
                brochureHref={existingMediaPath("pkgBrochure", pkg.BROCHURE)}
                policySummary={policySummary(policy)}
              />
            </div>
          </aside>

          {/* Tabbed sections, booking form, related packages */}
          <div className="min-w-0 space-y-12 lg:col-span-2">
            <SectionNav sections={sections} />

            {itinerary.length > 0 && (
              <Section id="itinerary" title={dayWise ? "Day-wise itinerary" : "Places you'll visit"}>
                {dayWise ? (
                  <>
                    <ItineraryDays days={days} />
                    {places.length > 0 && (
                      <div className="mt-10">
                        <h3 className="mb-4 font-display text-xl font-semibold text-slate-900">Also included</h3>
                        <PlacesGrid items={places} />
                      </div>
                    )}
                  </>
                ) : (
                  <PlacesGrid items={places} />
                )}
              </Section>
            )}

            <Section id="tour-information" title="Tour information">
              <InfoTabs tabs={infoTabs} />
            </Section>

            {hasNeedToKnow && (
              <Section id="need-to-know" title="Need to know">
                <NeedToKnow documents={documents} thingsToCarry={thingsToCarry} notes={notes} />
              </Section>
            )}

            <Section id="cancellation" title="Cancellation policy & payment terms">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="mb-2 flex items-center gap-2 font-bold text-slate-900">
                    <FaShieldAlt aria-hidden className="text-gw-brand" /> Cancellation policy
                  </h3>
                  <RichText text={policy} small className="text-sm leading-relaxed text-slate-600" />
                </div>
                <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-gw-brand">
                    <FaWallet aria-hidden />
                  </div>
                  <div className="text-sm text-slate-600">
                    <strong className="mb-0.5 block text-slate-900">Simple, direct payment</strong>
                    Payment is collected in advance via Google Pay / UPI — our team shares the details on
                    WhatsApp right after confirming your booking. No hidden charges.
                  </div>
                </div>
              </div>
            </Section>

            <section id="book" aria-labelledby="book-title" className="scroll-mt-40">
              <h2 id="book-title" className="mb-5 font-display text-2xl font-semibold text-slate-900">
                Book this tour
              </h2>
              <GuideBookingForm pkgId={pkg.PKG_ID} pkgAmount={amount} hotels={hotels} cancellationPolicy={policy} />
            </section>

            {related.length > 0 && (
              <Section id="more" title={cityName ? `More in ${cityName}` : "More tours"}>
                <RelatedPackages
                  items={related.map((r) => ({
                    id: r.PKG_ID,
                    href: packageHref(r),
                    title: titleCase(r.TITLE_NAME ?? ""),
                    amount: r.PKG_AMOUNT ?? 0,
                    image: existingMediaPath("pkgTitleImg", r.PKG_IMAGE),
                  }))}
                />
              </Section>
            )}
          </div>
        </div>
      </div>

      <MobileBookBar amount={amount} priceNote={priceNote} />
      <FaqSection path={`/packages/${pkg.SLUG}`} />
    </main>
  );
}
