import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { ContactInquiry } from "@/models";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { isRead } = (await req.json()) as { isRead?: boolean };
  await dbConnect();
  const inquiry = await ContactInquiry.findByIdAndUpdate(id, { IS_READ: !!isRead }, { returnDocument: "after" }).lean();
  if (!inquiry) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
  return NextResponse.json({ inquiry });
}
