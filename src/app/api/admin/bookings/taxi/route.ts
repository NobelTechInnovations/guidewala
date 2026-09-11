import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { TaxiBookingDetails } from "@/models";

export async function GET() {
  await dbConnect();
  const bookings = await TaxiBookingDetails.find({}).sort({ CREATED_ON: -1 }).lean();
  return NextResponse.json({ bookings });
}
