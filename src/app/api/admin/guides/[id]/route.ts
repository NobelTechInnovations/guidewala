import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { GuideDetails } from "@/models";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  const guide = await GuideDetails.findOne({ GUIDE_ID: Number(id) }).lean();
  if (!guide) return NextResponse.json({ error: "Guide not found." }, { status: 404 });
  return NextResponse.json({ guide });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = (await req.json()) as { status?: string };
  if (!status || !["P", "A", "R"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  await dbConnect();
  const guide = await GuideDetails.findOneAndUpdate(
    { GUIDE_ID: Number(id) },
    { STATUS: status, ACTION_ON: new Date() },
    { new: true }
  ).lean();
  if (!guide) return NextResponse.json({ error: "Guide not found." }, { status: 404 });
  return NextResponse.json({ guide });
}
