import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { CouponSendToMail, PromoCodeMaster } from "@/models";

export async function GET() {
  await dbConnect();
  const leads = await CouponSendToMail.find({}).sort({ CREATED_ON: -1 }).lean();
  const promoIds = [...new Set(leads.map((l) => l.PROMO_ID).filter(Boolean))];
  const promos = await PromoCodeMaster.find({ PROMO_ID: { $in: promoIds } })
    .select("PROMO_ID PROMO_TITLE -_id")
    .lean();
  const promoMap = new Map(promos.map((p) => [p.PROMO_ID, p.PROMO_TITLE]));

  return NextResponse.json({
    leads: leads.map((l) => ({ ...l, PROMO_TITLE: promoMap.get(l.PROMO_ID) || "" })),
  });
}
