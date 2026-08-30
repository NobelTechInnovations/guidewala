import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">{activeCityName}</h2>
        )}

        {packages.length === 0 ? (
          <p className="text-slate-400">No packages available for this city yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((p) => (
              <Link
                key={p.PKG_ID}
                href={`/packages/${p.PKG_ID}`}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="relative aspect-[4/3] bg-slate-100">
                  <Image
                    src={`${IMG_BASE}img/pkgTitleImg/${p.PKG_IMAGE}`}
                    alt={p.TITLE_NAME}
                    fill
                    sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 mb-2">{p.TITLE_NAME}</h3>
                  <p className="text-gw-brand font-extrabold">₹{p.PKG_AMOUNT.toLocaleString("en-IN")}/-</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
