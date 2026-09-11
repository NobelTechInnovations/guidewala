import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PkgBookingDetails, PackageTitleMaster, CityMaster } from "@/models";

export async function GET() {
  await dbConnect();
  const bookings = await PkgBookingDetails.find({}).sort({ BOOKING_DATE: -1 }).lean();
  const pkgIds = [...new Set(bookings.map((b) => b.PKG_ID).filter(Boolean))];
  const packages = await PackageTitleMaster.find({ PKG_ID: { $in: pkgIds } })
    .select("PKG_ID TITLE_NAME CITY_ID -_id")
    .lean();
  const cities = await CityMaster.find({}).select("CITY_ID CITY_NAME -_id").lean();
  const cityMap = new Map(cities.map((c) => [c.CITY_ID, c.CITY_NAME]));
  const pkgMap = new Map(packages.map((p) => [p.PKG_ID, p]));

  const result = bookings.map((b) => {
    const pkg = pkgMap.get(b.PKG_ID);
    return {
      ...b,
      TITLE_NAME: pkg?.TITLE_NAME || "",
      CITY_NAME: pkg ? cityMap.get(pkg.CITY_ID) || "" : "",
    };
  });

  return NextResponse.json({ bookings: result });
}
