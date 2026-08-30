import type { Metadata } from "next";
import Image from "next/image";
import PageBanner from "@/components/booking/PageBanner";
import { dbConnect } from "@/lib/mongodb";
import { PromoCodeMaster, VendorDetails, CityMaster } from "@/models";

export const metadata: Metadata = {
  title: "Coupons | Guidewala",
  description: "Browse all Guidewala partner coupons and exclusive deals.",
};

const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE || "https://admin.guidewala.co.in/";

type PromoLean = {
  PROMO_ID: string;
  VENDER_ID: string;
  PROMO_TITLE: string;
  PROMO_CODE: string;
  PROMO_CODE_IMG: string;
  PROMO_DESC: string;
  VALID_FROM?: Date;
  VALID_TO?: Date;
};

async function getCoupons() {
  await dbConnect();
  const promos = (await PromoCodeMaster.find({}).sort({ CREATED_ON: -1 }).lean()) as unknown as PromoLean[];

  const vendorIds = [...new Set(promos.map((p) => p.VENDER_ID))];
  const vendors = (await VendorDetails.find({ VENDOR_ID: { $in: vendorIds } }).lean()) as unknown as {
    VENDOR_ID: string;
    COMPANY_NAME: string;
    ADDRESS1: string;
    WEBSITE: string;
    CITY_ID: string;
  }[];
  const cities = (await CityMaster.find({}).lean()) as unknown as { CITY_ID: string; CITY_NAME: string }[];

  const vendorMap = new Map(vendors.map((v) => [v.VENDOR_ID, v]));
  const cityMap = new Map(cities.map((c) => [c.CITY_ID, c.CITY_NAME]));

  return promos.map((p) => {
    const vendor = vendorMap.get(p.VENDER_ID);
    return {
      ...p,
      companyName: vendor?.COMPANY_NAME || "",
      address: vendor?.ADDRESS1 || "",
      website: vendor?.WEBSITE || "",
      cityName: vendor ? cityMap.get(vendor.CITY_ID) || "" : "",
    };
  });
}

export default async function CouponsPage() {
  const coupons = await getCoupons();

  return (
    <main>
      <PageBanner title="Coupons" crumb="Coupons" />

      <div className="max-w-6xl mx-auto px-6 py-14">
        {coupons.length === 0 ? (
          <p className="text-center text-slate-400 py-10">No coupons available right now — check back soon!</p>
        ) : (
          <div className="space-y-10">
            {coupons.map((c) => (
              <div
                key={c.PROMO_ID}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="p-8 border-b-2 border-gw-red md:border-b-0">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">{c.PROMO_TITLE}</h3>
                  <div className="border-2 border-dashed border-gw-red text-gw-red text-2xl font-bold tracking-widest text-center py-3 rounded-lg mb-4 uppercase">
                    {c.PROMO_CODE}
                  </div>
                  <p className="font-bold text-slate-900">
                    {c.companyName} {c.cityName && <span className="font-normal text-slate-500">({c.cityName})</span>}
                  </p>
                  {c.address && <p className="text-sm text-slate-500 mt-2">📍 {c.address}</p>}
                  {c.website && (
                    <a
                      href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gw-brand hover:underline mt-2 inline-block"
                    >
                      🌐 Visit website
                    </a>
                  )}
                  <div className="flex justify-between text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
                    <span>
                      From: {c.VALID_FROM ? new Date(c.VALID_FROM).toLocaleDateString() : "—"}
                    </span>
                    <span>Until: {c.VALID_TO ? new Date(c.VALID_TO).toLocaleDateString() : "—"}</span>
                  </div>
                  {c.PROMO_DESC && <p className="text-sm text-slate-600 mt-4">{c.PROMO_DESC}</p>}
                </div>
                <div className="relative min-h-[220px] bg-slate-100">
                  <Image
                    src={`${IMG_BASE}img/PromoCode/${c.PROMO_CODE_IMG}`}
                    alt={c.PROMO_TITLE}
                    fill
                    sizes="(min-width:768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
