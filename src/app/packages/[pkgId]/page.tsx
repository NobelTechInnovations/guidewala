import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FaShieldAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaStar,
  FaUserTie,
  FaWallet,
  FaClock,
} from "react-icons/fa";
import GuideBookingForm from "@/components/booking/GuideBookingForm";
import { dbConnect } from "@/lib/mongodb";
import { PackageTitleMaster, PackageDescDetails, CityMaster, HotelMaster } from "@/models";

const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE || "https://admin.guidewala.co.in/";

const UNIVERSAL_INCLUSIONS = [
  "Government-approved, verified guide",
  "Monument entry fee assistance",
  "Local history & storytelling",
  "Transparent, upfront pricing",
];

type PackageLean = {
  PKG_ID: number;
  TITLE_NAME: string;
  CITY_ID: string;
  PKG_AMOUNT: number;
  PKG_IMAGE: string;
  PKG_DESC: string;
};
type ItineraryLean = { ID: number; ITINERARY: string; PACKAGE_DESC: string; PKG_IMAGE: string };

async function getPackage(pkgId: number) {
  await dbConnect();
  const pkg = (await PackageTitleMaster.findOne({ PKG_ID: pkgId, IS_ACTIVE: "Y" }).lean()) as unknown as PackageLean | null;
  if (!pkg) return null;

  const [city, itinerary, hotels, related] = await Promise.all([
    CityMaster.findOne({ CITY_ID: pkg.CITY_ID }).lean() as unknown as { CITY_NAME: string } | null,
    PackageDescDetails.find({ PKG_ID: pkgId }).lean() as unknown as ItineraryLean[],
    HotelMaster.find({ CITY_ID: pkg.CITY_ID, IS_ACTIVE: "Y" }).lean() as unknown as { HOTEL_NAME: string }[],
    PackageTitleMaster.find({ CITY_ID: pkg.CITY_ID, IS_ACTIVE: "Y", PKG_ID: { $ne: pkgId } })
      .limit(3)
      .lean() as unknown as PackageLean[],
  ]);

  return {
    pkg,
    cityName: city?.CITY_NAME || "",
    itinerary,
    hotels: hotels.map((h) => h.HOTEL_NAME),
    related,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pkgId: string }>;
}): Promise<Metadata> {
  const { pkgId } = await params;
  const data = await getPackage(Number(pkgId));
  if (!data) return { title: "Package not found | Guidewala" };
  return {
    title: `${data.pkg.TITLE_NAME} | Guidewala`,
    description: `Book a government-approved guide for ${data.pkg.TITLE_NAME} in ${data.cityName}.`,
  };
}

export default async function PackageDetailsPage({
  params,
}: {
  params: Promise<{ pkgId: string }>;
}) {
  const { pkgId } = await params;
  const data = await getPackage(Number(pkgId));
  if (!data) notFound();

  const { pkg, cityName, itinerary, hotels, related } = data;

  return (
    <main>
      {/* Hero */}
      <div className="relative h-[46vh] min-h-[360px] bg-slate-900">
        <Image
          src={`${IMG_BASE}img/pkgTitleImg/${pkg.PKG_IMAGE}`}
          alt={pkg.TITLE_NAME}
          fill
          sizes="100vw"
          priority
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto px-6 pb-8 w-full">
            <nav className="text-sm text-white/70 mb-3 flex items-center gap-2">
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
              <span>/</span>
              <Link href="/book-guide" className="hover:text-white transition">
                Book Guide
              </Link>
              <span>/</span>
              <span className="text-white">{pkg.TITLE_NAME}</span>
            </nav>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center gap-1.5 bg-gw-brand text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                <FaShieldAlt /> Verified Guide
              </span>
              <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full">
                <FaMapMarkerAlt /> {cityName}
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-semibold text-white text-balance max-w-3xl">
              {pkg.TITLE_NAME}
            </h1>
            <div className="flex items-center gap-1.5 mt-3 text-white/90 text-sm font-semibold">
              <span className="flex text-gw-yellow text-xs gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar key={i} />
                ))}
              </span>
              4.8 Rated Experience
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            {pkg.PKG_DESC && (
              <div>
                <h2 className="font-display text-2xl font-semibold text-slate-900 mb-4">Overview</h2>
                <div
                  className="prose prose-slate max-w-none text-slate-600"
                  dangerouslySetInnerHTML={{ __html: pkg.PKG_DESC }}
                />
              </div>
            )}

            {/* What's included */}
            <div>
              <h2 className="font-display text-2xl font-semibold text-slate-900 mb-5">What&apos;s Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {UNIVERSAL_INCLUSIONS.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-700"
                  >
                    <FaCheckCircle className="text-gw-brand shrink-0" /> {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights / itinerary */}
            {itinerary.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-semibold text-slate-900 mb-5">
                  Places You&apos;ll Visit
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {itinerary.map((item) => (
                    <div key={item.ID} className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                      {item.PKG_IMAGE && (
                        <div className="relative aspect-[16/10]">
                          <Image
                            src={`${IMG_BASE}img/pkgItinImg/${item.PKG_IMAGE}`}
                            alt={item.ITINERARY}
                            fill
                            sizes="(min-width:1024px) 33vw, 50vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-bold text-slate-900 mb-1">{item.ITINERARY}</h3>
                        {item.PACKAGE_DESC && (
                          <div
                            className="text-sm text-slate-500"
                            dangerouslySetInnerHTML={{ __html: item.PACKAGE_DESC }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment note */}
            <div className="flex items-start gap-4 bg-slate-50 border border-slate-200 rounded-xl p-5">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-gw-brand shrink-0">
                <FaWallet />
              </div>
              <div className="text-sm text-slate-600">
                <strong className="text-slate-900 block mb-0.5">Simple, direct payment</strong>
                Payment is collected in advance via Google Pay / UPI — our team shares the details on
                WhatsApp right after confirming your booking. No hidden charges.
              </div>
            </div>

            {/* Related packages */}
            {related.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-semibold text-slate-900 mb-5">
                  More in {cityName}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map((r) => (
                    <Link
                      key={r.PKG_ID}
                      href={`/packages/${r.PKG_ID}`}
                      className="group bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="relative aspect-[4/3] bg-slate-100">
                        <Image
                          src={`${IMG_BASE}img/pkgTitleImg/${r.PKG_IMAGE}`}
                          alt={r.TITLE_NAME}
                          fill
                          sizes="200px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{r.TITLE_NAME}</h4>
                        <p className="text-gw-brand text-sm font-extrabold">
                          ₹{r.PKG_AMOUNT.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky booking sidebar */}
          <div>
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Starting from
                </span>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-3xl font-extrabold text-gw-brand">
                    ₹{pkg.PKG_AMOUNT.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-slate-400">/ person</span>
                </div>

                <ul className="space-y-3 mb-6 text-sm text-slate-600">
                  <li className="flex items-center gap-3">
                    <FaUserTie className="text-gw-brand shrink-0" /> Government-approved guide
                  </li>
                  <li className="flex items-center gap-3">
                    <FaClock className="text-gw-brand shrink-0" /> Flexible scheduling
                  </li>
                  <li className="flex items-center gap-3">
                    <FaMapMarkerAlt className="text-gw-brand shrink-0" /> {cityName}
                  </li>
                </ul>

                <a
                  href="#book"
                  className="block text-center bg-gw-red hover:bg-red-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md"
                >
                  Book This Tour
                </a>
              </div>

              <div id="book">
                <GuideBookingForm pkgId={pkg.PKG_ID} pkgAmount={pkg.PKG_AMOUNT} hotels={hotels} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
