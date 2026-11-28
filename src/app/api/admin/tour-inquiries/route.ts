import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { TourInquiry } from "@/models";

export async function GET() {
  await dbConnect();
  const inquiries = await TourInquiry.find({}).sort({ CREATED_ON: -1 }).lean();
  return NextResponse.json({ inquiries });
}
