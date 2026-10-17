import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Voucher } from "@/models";
import { parseVoucherBody } from "../fields";

// [id] is the voucher number (GW-V-0001), not the Mongo _id.
const notFound = () => NextResponse.json({ error: "Voucher not found." }, { status: 404 });

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  const voucher = await Voucher.findOne({ VOUCHER_NO: id }).lean();
  if (!voucher) return notFound();
  return NextResponse.json({ voucher });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }
  const parsed = parseVoucherBody(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  await dbConnect();
  // Full replace of the editable fields; VOUCHER_NO and CREATED_ON are never touched.
  const voucher = await Voucher.findOneAndUpdate(
    { VOUCHER_NO: id },
    { ...parsed.value, UPDATED_ON: new Date() },
    { returnDocument: "after" }
  ).lean();
  if (!voucher) return notFound();
  return NextResponse.json({ voucher });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  const deleted = await Voucher.findOneAndDelete({ VOUCHER_NO: id }).lean();
  if (!deleted) return notFound();
  return NextResponse.json({ ok: true });
}
