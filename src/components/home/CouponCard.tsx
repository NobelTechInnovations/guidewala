"use client";

import Image from "next/image";
import { FaRegClock } from "react-icons/fa";
import { useCouponPopup } from "@/components/CouponPopup";

export type CouponCardData = {
  promoId: string;
  title: string;
  code: string;
  imgUrl: string;
  validTo: string;
};

export default function CouponCard({ coupon }: { coupon: CouponCardData }) {
  const { open } = useCouponPopup();

  return (
    <div className="min-w-[260px] max-w-[260px] md:min-w-[300px] md:max-w-[300px] bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group mb-4">
      <div className="h-32 md:h-36 relative overflow-hidden bg-slate-100">
        <Image
          src={coupon.imgUrl}
          alt={coupon.title}
          fill
          sizes="300px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute bottom-0 left-0 bg-gw-green text-white text-xs font-bold px-3 py-1.5 rounded-tr-lg shadow-md tracking-wider z-10">
          {coupon.code}
        </span>
      </div>
      <div className="p-4 md:p-5 flex flex-col gap-2 md:gap-3">
        <h4 className="font-bold text-slate-900 text-sm md:text-base truncate" title={coupon.title}>
          {coupon.title}
        </h4>
        <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
          <FaRegClock /> Expires: {coupon.validTo}
        </p>
        <button
          type="button"
          onClick={() => open(coupon)}
          className="mt-2 md:mt-3 w-full bg-slate-50 border-2 border-gw-green text-gw-green text-xs md:text-sm font-bold py-2 md:py-2.5 rounded-lg hover:bg-gw-green hover:text-white transition-colors shadow-sm"
        >
          Get Coupon
        </button>
      </div>
    </div>
  );
}
