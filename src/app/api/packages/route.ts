import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PackageTitleMaster, CityMaster } from "@/models";

const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE || "https://admin.guidewala.co.in/";

// Public read-only endpoint — list active guide packages, optionally
// filtered by city. Used by the mobile app's Book Guide / Featured Tours
// screens (the web app queries Mongo directly from Server Components).
export async function GET(req: NextRequest) {
  await dbConnect();
  const cityId = req.nextUrl.searchParams.get("city");

  const filter: Record<string, string> = { IS_ACTIVE: "Y" };
  if (cityId) filter.CITY_ID = cityId;

  const [packages, cities] = await Promise.all([
    PackageTitleMaster.find(filter).sort({ PKG_AMOUNT: 1 }).lean(),
    CityMaster.find({}).select("CITY_ID CITY_NAME -_id").lean(),
  ]);

  const cityMap = new Map(cities.map((c) => [c.CITY_ID, c.CITY_NAME]));

  const result = packages.map((p) => ({
    pkgId: p.PKG_ID,
    title: p.TITLE_NAME,
    cityId: p.CITY_ID,
    cityName: cityMap.get(p.CITY_ID) || "",
    amount: p.PKG_AMOUNT,
    image: `${IMG_BASE}img/pkgTitleImg/${p.PKG_IMAGE}`,
  }));

  return NextResponse.json({ packages: result });
}
