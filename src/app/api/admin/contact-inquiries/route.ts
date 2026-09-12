import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { ContactInquiry } from "@/models";

export async function GET() {
  await dbConnect();
  const inquiries = await ContactInquiry.find({}).sort({ CREATED_ON: -1 }).lean();
  return NextResponse.json({ inquiries });
}
