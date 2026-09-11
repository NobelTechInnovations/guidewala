import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { CityMaster } from "@/models";

// Public read-only endpoint — used by the mobile app (and any other client)
// to list active cities. Mirrors the data the web app's Server Components
// already query directly against Mongo.
export async function GET() {
  await dbConnect();
  const cities = await CityMaster.find({ IS_ACTIVE: "Y" })
    .sort({ CITY_NAME: 1 })
    .select("CITY_ID CITY_NAME -_id")
    .lean();
  return NextResponse.json({ cities });
}
