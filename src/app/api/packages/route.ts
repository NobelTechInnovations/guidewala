import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { mediaAbsoluteUrl } from "@/lib/url";
import { isShown } from "@/lib/packages";
import { PackageTitleMaster, CityMaster } from "@/models";

// Public read-only endpoint — list active guide packages, optionally
// filtered by city. Used by the mobile app's Book Guide / Featured Tours
// screens (the web app queries Mongo directly from Server Components).
// The list itself is not filtered by SHOW_ON_HOME (that only curates the web
// home carousel); `showOnHome` is exposed so clients can curate their own.
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
    image: mediaAbsoluteUrl("pkgTitleImg", p.PKG_IMAGE, req),
    showOnHome: isShown(p.SHOW_ON_HOME) ? "Y" : "N",
  }));

  return NextResponse.json({ packages: result });
}
