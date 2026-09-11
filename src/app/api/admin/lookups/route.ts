import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { CityMaster, StateMaster, CountryMaster, VendorTypeMaster } from "@/models";

// Shared dropdown data for admin forms (vendor/hotel/package registration).
export async function GET() {
  await dbConnect();
  const [cities, states, countries, vendorTypes] = await Promise.all([
    CityMaster.find({}).sort({ CITY_NAME: 1 }).select("CITY_ID CITY_NAME -_id").lean(),
    StateMaster.find({}).sort({ STATE_NAME: 1 }).select("STATE_ID STATE_NAME -_id").lean(),
    CountryMaster.find({}).sort({ COUNTRY_NAME: 1 }).select("COUNTRY_ID COUNTRY_NAME -_id").lean(),
    VendorTypeMaster.find({}).sort({ VEN_TYP_NAME: 1 }).select("VEN_TYP_ID VEN_TYP_NAME -_id").lean(),
  ]);
  return NextResponse.json({ cities, states, countries, vendorTypes });
}
