import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { HotelMaster } from "@/models";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  const hotel = await HotelMaster.findOne({ HOTEL_ID: Number(id) }).lean();
  if (!hotel) return NextResponse.json({ error: "Hotel not found." }, { status: 404 });
  return NextResponse.json({ hotel });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { hotelName, cityId, isActive } = (await req.json()) as Record<string, string>;
  await dbConnect();
  const hotel = await HotelMaster.findOneAndUpdate(
    { HOTEL_ID: Number(id) },
    { HOTEL_NAME: hotelName, CITY_ID: cityId, IS_ACTIVE: isActive },
    { new: true }
  ).lean();
  if (!hotel) return NextResponse.json({ error: "Hotel not found." }, { status: 404 });
  return NextResponse.json({ hotel });
}
