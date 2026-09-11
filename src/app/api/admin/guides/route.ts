import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { GuideDetails } from "@/models";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = req.nextUrl;
  const state = searchParams.get("state");
  const city = searchParams.get("city");
  const status = searchParams.get("status");

  const filter: Record<string, unknown> = {};
  if (state && state !== "ALL") filter.STATE = state;
  if (city) filter.CITY = { $regex: city, $options: "i" };
  if (status && status !== "ALL") filter.STATUS = status;

  const guides = await GuideDetails.find(filter).sort({ REGISTRED_ON: -1 }).lean();
  return NextResponse.json({ guides });
}
