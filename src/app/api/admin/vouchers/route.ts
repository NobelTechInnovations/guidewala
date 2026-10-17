import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Voucher } from "@/models";
import { parseVoucherBody, escapeRegex, nextVoucherNo } from "./fields";

// Initial attempt + 3 retries when a concurrent create grabbed the same number.
const MAX_NUMBER_RETRIES = 3;

export async function GET(req: NextRequest) {
  await dbConnect();
  const q = (req.nextUrl.searchParams.get("q") || "").trim();

  const filter: Record<string, unknown> = {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ VOUCHER_NO: rx }, { GUEST_NAME: rx }, { CONTACT_NO: rx }];
  }

  const vouchers = await Voucher.find(filter).sort({ CREATED_ON: -1, _id: -1 }).limit(200).lean();
  return NextResponse.json({ vouchers });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }
  const parsed = parseVoucherBody(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  await dbConnect();
  for (let attempt = 0; attempt <= MAX_NUMBER_RETRIES; attempt++) {
    // Re-read each attempt: a duplicate means someone else just took our number.
    const existing = await Voucher.find({}).select("VOUCHER_NO -_id").lean();
    const voucherNo = nextVoucherNo(existing.map((v) => String(v.VOUCHER_NO || "")));
    const now = new Date();
    try {
      const doc = await Voucher.create({ ...parsed.value, VOUCHER_NO: voucherNo, CREATED_ON: now, UPDATED_ON: now });
      return NextResponse.json({ voucher: doc.toObject() }, { status: 201 });
    } catch (err) {
      // 11000 = duplicate key on the unique VOUCHER_NO index; anything else is a real failure.
      if ((err as { code?: number }).code !== 11000) throw err;
    }
  }
  return NextResponse.json({ error: "Could not assign a voucher number. Please try again." }, { status: 409 });
}
