import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FaShieldAlt, FaArrowRight } from "react-icons/fa";
import PageBanner from "@/components/booking/PageBanner";
import { dbConnect } from "@/lib/mongodb";
import { CityMaster, PackageTitleMaster } from "@/models";

export const metadata: Metadata = {
  title: "Book Your Guide | Guidewala",
  description: "Select a city and choose from government-approved local guide packages across India.",
};

const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE || "https://admin.guidewala.co.in/";

type CityLean = { CITY_ID: string; CITY_NAME: string };
type PackageLean = {
  PKG_ID: number;
  TITLE_NAME: string;
  CITY_ID: string;
  PKG_AMOUNT: number;
  PKG_IMAGE: string;
};

async function getCities(): Promise<CityLean[]> {
  await dbConnect();
  return (await CityMaster.find({ IS_ACTIVE: "Y" })
    .sort({ CITY_NAME: 1 })
    .lean()) as unknown as CityLean[];
}

async function getPackagesForCity(cityId: string): Promise<PackageLean[]> {
  await dbConnect();
  return (await PackageTitleMaster.find({ CITY_ID: cityId, IS_ACTIVE: "Y" })
    .sort({ PKG_AMOUNT: 1 })
    .lean()) as unknown as PackageLean[];
}

export default async function BookGuidePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const params = await searchParams;
  const cities = await getCities();
  const activeCity = params.city || cities[0]?.CITY_ID;
  const packages = activeCity ? await getPackagesForCity(activeCity) : [];
  const activeCityName = cities.find((c) => c.CITY_ID === activeCity)?.CITY_NAME;

  return (
    <main>
      <PageBanner title="Book your Guide" crumb="Book Guide" />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <p className="font-bold text-slate-800 mb-4">Select your city where you want our tour Guide services</p>

        <div className="flex flex-wrap gap-2 mb-10">
          {cities.map((c) => (
            <Link
              key={c.CITY_ID}
              href={`/book-guide?city=${c.CITY_ID}`}
              className={`px-5 py-2 rounded-full text-sm font-bold border transition-colors ${
                c.CITY_ID === activeCity
                  ? "bg-gw-brand text-white border-gw-brand"
                  : "bg-white text-slate-600 border-slate-200 hover:border-gw-brand hover:text-gw-brand"
              }`}
            >
              {c.CITY_NAME}
            </Link>
          ))}
        </div>

        {activeCityName && (
          <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">{activeCityName}</h2>
        )}

        {packages.length === 0 ? (
          <p className="text-slate-400">No packages available for this city yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((p) => (
              <Link
                key={p.PKG_ID}
                href={`/packages/${p.PKG_ID}`}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-slate-100">
                  <Image
                    src={`${IMG_BASE}img/pkgTitleImg/${p.PKG_IMAGE}`}
                    alt={p.TITLE_NAME}
                    fill
                    sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur text-gw-brand text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    <FaShieldAlt /> Verified Guide
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-bold text-slate-900 mb-3 leading-snug flex-grow">{p.TITLE_NAME}</h3>
                  <div className="flex items-end justify-between pt-3 border-t border-slate-100">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Starting from
                      </span>
                      <span className="text-gw-brand font-extrabold text-lg">
                        ₹{p.PKG_AMOUNT.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-gw-red uppercase tracking-wide">
                      View <FaArrowRight className="text-[10px] group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
