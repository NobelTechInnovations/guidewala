import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { GuideDetails } from "@/models";
import { sendTemplateMail } from "@/lib/emailTemplates";

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
  const existing = await GuideDetails.findOne({ GUIDE_ID: Number(id) }).select("STATUS EMAIL FIRST_NAME LAST_NAME PHONE_NO").lean();
  if (!existing) return NextResponse.json({ error: "Guide not found." }, { status: 404 });

  const guide = await GuideDetails.findOneAndUpdate(
    { GUIDE_ID: Number(id) },
    { STATUS: status, ACTION_ON: new Date() },
    { returnDocument: "after" }
  ).lean();

  // Only notify the guide when the status actually changes into Accepted/Rejected —
  // re-clicking the same status (or moving back to Pending) shouldn't re-send mail.
  if (status !== existing.STATUS && (status === "A" || status === "R") && existing.EMAIL) {
    const name = `${existing.FIRST_NAME} ${existing.LAST_NAME || ""}`.trim();
    await sendTemplateMail(status === "A" ? "GUIDE_ACCEPTED" : "GUIDE_REJECTED", existing.EMAIL, {
      name,
      email: existing.EMAIL,
      phone: existing.PHONE_NO,
    });
  }

  return NextResponse.json({ guide });
}
