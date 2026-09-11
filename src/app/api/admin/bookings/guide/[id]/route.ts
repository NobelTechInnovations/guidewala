import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PkgBookingDetails, PackageTitleMaster, CityMaster, PromoCodeMaster, VendorDetails } from "@/models";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  const booking = await PkgBookingDetails.findOne({ BOOLING_ID: id }).lean();
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

  const pkg = await PackageTitleMaster.findOne({ PKG_ID: booking.PKG_ID }).select("TITLE_NAME CITY_ID -_id").lean();
  const city = pkg ? await CityMaster.findOne({ CITY_ID: pkg.CITY_ID }).select("CITY_NAME -_id").lean() : null;

  let coupon: { PROMO_TITLE?: string; PROMO_CODE?: string; VENDER_ID?: string } | null = null;
  let vendorName = "";
  if (booking.PROMO_ID) {
    coupon = await PromoCodeMaster.findOne({ PROMO_ID: booking.PROMO_ID }).lean();
    if (coupon?.VENDER_ID) {
      const vendor = await VendorDetails.findOne({ VENDOR_ID: coupon.VENDER_ID }).select("COMPANY_NAME -_id").lean();
      vendorName = vendor?.COMPANY_NAME || "";
    }
  }

  return NextResponse.json({
    booking: {
      ...booking,
      TITLE_NAME: pkg?.TITLE_NAME || "",
      CITY_NAME: city?.CITY_NAME || "",
      COUPON_TITLE: coupon?.PROMO_TITLE || "",
      COUPON_CODE: coupon?.PROMO_CODE || "",
      COUPON_VENDOR: vendorName,
    },
  });
}
