import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { HotelBookingDetails } from "@/models";

export async function GET() {
  await dbConnect();
  const bookings = await HotelBookingDetails.find({}).sort({ CREATED_ON: -1 }).lean();
  return NextResponse.json({ bookings });
}
