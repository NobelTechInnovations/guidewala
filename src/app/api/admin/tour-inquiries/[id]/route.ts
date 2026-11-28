import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { TourInquiry } from "@/models";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { isRead } = (await req.json()) as { isRead?: boolean };
  await dbConnect();
  const inquiry = await TourInquiry.findByIdAndUpdate(id, { IS_READ: !!isRead }, { returnDocument: "after" }).lean();
  if (!inquiry) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
  return NextResponse.json({ inquiry });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  const inquiry = await TourInquiry.findByIdAndDelete(id).lean();
  if (!inquiry) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
