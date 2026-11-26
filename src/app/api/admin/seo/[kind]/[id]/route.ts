import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { SEO_KINDS, isSeoKind, parseSeoBody } from "../../fields";

type Ctx = { params: Promise<{ kind: string; id: string }> };
const notFound = () => NextResponse.json({ error: "Not found." }, { status: 404 });

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { kind, id } = await params;
  if (!isSeoKind(kind) || !isValidObjectId(id)) return notFound();
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const parsed = parseSeoBody(kind, body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  await dbConnect();
  try {
    const item = await SEO_KINDS[kind].model.findByIdAndUpdate(id, parsed.doc, { returnDocument: "after" }).lean();
    return item ? NextResponse.json({ item }) : notFound();
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return NextResponse.json({ error: "Another entry already uses that page path." }, { status: 400 });
    throw e;
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { kind, id } = await params;
  if (!isSeoKind(kind) || !isValidObjectId(id)) return notFound();
  await dbConnect();
  await SEO_KINDS[kind].model.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
