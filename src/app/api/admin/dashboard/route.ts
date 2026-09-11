import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PkgBookingDetails, TaxiBookingDetails, HotelBookingDetails, GuideDetails, VendorDetails } from "@/models";

export async function GET() {
  await dbConnect();

  const [totalGuideBooking, totalTaxiBooking, totalHotelBooking, totalGuide, totalVendor, pendingGuides] =
    await Promise.all([
      PkgBookingDetails.countDocuments({}),
      TaxiBookingDetails.countDocuments({}),
      HotelBookingDetails.countDocuments({}),
      GuideDetails.countDocuments({}),
      VendorDetails.countDocuments({}),
      GuideDetails.find({ STATUS: "P" })
        .sort({ REGISTRED_ON: -1 })
        .limit(10)
        .select("GUIDE_ID FIRST_NAME LAST_NAME PHONE_NO EMAIL CITY STATE COUNTRY PIN_CODE REGISTRED_ON -_id")
        .lean(),
    ]);

  return NextResponse.json({
    totalGuideBooking,
    totalTaxiBooking,
    totalHotelBooking,
    totalGuide,
    totalVendor,
    pendingGuides,
  });
}
