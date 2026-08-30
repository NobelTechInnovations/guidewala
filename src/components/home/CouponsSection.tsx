import Link from "next/link";
import { dbConnect } from "@/lib/mongodb";
import { PromoCodeMaster } from "@/models";
import CouponCard, { CouponCardData } from "./CouponCard";

const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE || "https://admin.guidewala.co.in/";

type PromoLean = {
  PROMO_ID: string;
  PROMO_TITLE?: string;
  PROMO_CODE?: string;
  PROMO_CODE_IMG?: string;
  VALID_TO?: Date;
};

async function getActiveCoupons(): Promise<CouponCardData[]> {
  await dbConnect();
  // Source table uses "Y"/"N" for IS_ACTIVE (unlike the "1"/"0" convention
  // elsewhere in the schema) — confirmed against the migrated snapshot.
  const promos = (await PromoCodeMaster.find({
    IS_ACTIVE: "Y",
    VALID_TO: { $gte: new Date() },
  })
    .sort({ CREATED_ON: -1 })
    .limit(12)
    .lean()) as unknown as PromoLean[];

  return promos.map((p) => ({
    promoId: p.PROMO_ID,
    title: p.PROMO_TITLE || "",
    code: p.PROMO_CODE || "",
    imgUrl: `${IMG_BASE}img/PromoCode/${p.PROMO_CODE_IMG || ""}`,
    validTo: p.VALID_TO ? new Date(p.VALID_TO).toLocaleDateString() : "—",
  }));
}

export default async function CouponsSection() {
  const coupons = await getActiveCoupons();

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-end mb-6 md:mb-8 border-b border-slate-100 pb-3 md:pb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Exclusive <span className="text-gw-green">Deals</span>
            </h2>
            <p className="text-sm md:text-base text-slate-500 mt-1">Grab these offers before they expire!</p>
          </div>
          <Link
            href="/coupons"
            className="text-xs md:text-sm font-bold text-gw-green hover:text-green-700 tracking-wide uppercase transition-colors whitespace-nowrap"
          >
            View All &rarr;
          </Link>
        </div>

        {coupons.length > 0 ? (
          <div className="w-full">
            <div className="flex overflow-x-auto gap-5 py-5 px-1 [scrollbar-width:thin]">
              {coupons.map((c) => (
                <CouponCard key={c.promoId} coupon={c} />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-slate-400 text-sm py-6">No active coupons right now — check back soon!</p>
        )}
      </div>
    </section>
  );
}
