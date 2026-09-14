import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { EmailTemplate } from "@/models";
import { getTemplate } from "@/lib/emailTemplates";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const template = await getTemplate(key).catch(() => null);
  if (!template) return NextResponse.json({ error: "Template not found." }, { status: 404 });
  return NextResponse.json({ template });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const { subject, bodyHtml } = (await req.json()) as { subject?: string; bodyHtml?: string };
  if (!subject || !bodyHtml) {
    return NextResponse.json({ error: "Subject and body are required." }, { status: 400 });
  }
  await dbConnect();
  const template = await EmailTemplate.findOneAndUpdate(
    { KEY: key },
    { SUBJECT: subject, BODY_HTML: bodyHtml, UPDATED_ON: new Date() },
    { returnDocument: "after" }
  ).lean();
  if (!template) return NextResponse.json({ error: "Template not found." }, { status: 404 });
  return NextResponse.json({ template });
}
