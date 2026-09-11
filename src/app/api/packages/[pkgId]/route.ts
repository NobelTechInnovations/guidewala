import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PackageTitleMaster, PackageDescDetails, CityMaster, HotelMaster } from "@/models";

const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE || "https://admin.guidewala.co.in/";

// Public read-only endpoint — single package with itinerary + nearby
// hotels, matching what the web app's /packages/[pkgId] page shows.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ pkgId: string }> }) {
  const { pkgId } = await params;
  await dbConnect();

  const pkg = await PackageTitleMaster.findOne({ PKG_ID: Number(pkgId), IS_ACTIVE: "Y" }).lean();
  if (!pkg) return NextResponse.json({ error: "Package not found." }, { status: 404 });

  const [city, itinerary, hotels] = await Promise.all([
    CityMaster.findOne({ CITY_ID: pkg.CITY_ID }).select("CITY_NAME -_id").lean(),
    PackageDescDetails.find({ PKG_ID: Number(pkgId) }).select("ITINERARY PACKAGE_DESC PKG_IMAGE -_id").lean(),
    HotelMaster.find({ CITY_ID: pkg.CITY_ID, IS_ACTIVE: "Y" }).select("HOTEL_NAME -_id").lean(),
  ]);

  return NextResponse.json({
    pkgId: pkg.PKG_ID,
    title: pkg.TITLE_NAME,
    cityId: pkg.CITY_ID,
    cityName: city?.CITY_NAME || "",
    amount: pkg.PKG_AMOUNT,
    image: `${IMG_BASE}img/pkgTitleImg/${pkg.PKG_IMAGE}`,
    description: pkg.PKG_DESC,
    itinerary: itinerary.map((i) => ({
      title: i.ITINERARY,
      description: i.PACKAGE_DESC,
      image: i.PKG_IMAGE ? `${IMG_BASE}img/pkgItinImg/${i.PKG_IMAGE}` : null,
    })),
    hotels: hotels.map((h) => h.HOTEL_NAME),
  });
}
