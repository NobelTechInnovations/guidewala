import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { HotelMaster, CityMaster } from "@/models";
import { nextNumericId } from "@/lib/ids";

export async function GET(req: NextRequest) {
  await dbConnect();
  const cityId = req.nextUrl.searchParams.get("city");
  const status = req.nextUrl.searchParams.get("status");

  const filter: Record<string, string> = {};
  if (cityId) filter.CITY_ID = cityId;
  if (status && status !== "ALL") filter.IS_ACTIVE = status;

  const [hotels, cities] = await Promise.all([
    HotelMaster.find(filter).sort({ CREATED_ON: -1 }).lean(),
    CityMaster.find({}).select("CITY_ID CITY_NAME -_id").lean(),
  ]);
  const cityMap = new Map(cities.map((c) => [c.CITY_ID, c.CITY_NAME]));

  return NextResponse.json({
    hotels: hotels.map((h) => ({ ...h, CITY_NAME: cityMap.get(h.CITY_ID) || "" })),
  });
}

export async function POST(req: NextRequest) {
  const { hotelName, cityId, isActive } = (await req.json()) as Record<string, string>;
  if (!hotelName || !cityId) {
    return NextResponse.json({ error: "Hotel Name and City are required." }, { status: 400 });
  }
  await dbConnect();
  const hotelId = await nextNumericId(HotelMaster, "HOTEL_ID");
  await HotelMaster.create({
    HOTEL_ID: hotelId,
    HOTEL_NAME: hotelName,
    CITY_ID: cityId,
    IS_ACTIVE: isActive || "Y",
    CREATED_ON: new Date(),
  });
  return NextResponse.json({ hotelId }, { status: 201 });
}
