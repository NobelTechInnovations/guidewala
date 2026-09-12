import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { EmailTemplate } from "@/models";
import { ensureAllTemplatesSeeded } from "@/lib/emailTemplates";

export async function GET() {
  await dbConnect();
  await ensureAllTemplatesSeeded();
  const templates = await EmailTemplate.find({}).sort({ LABEL: 1 }).lean();
  return NextResponse.json({ templates });
}
