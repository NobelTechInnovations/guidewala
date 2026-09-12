import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PromoCodeMaster } from "@/models";
import { newStringId } from "@/lib/ids";
import { saveAdminUpload } from "@/lib/upload";
import { getVendorSession } from "@/lib/vendorAuth";

export async function GET(req: NextRequest) {
  const session = await getVendorSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  await dbConnect();
  const promos = await PromoCodeMaster.find({ VENDER_ID: session.vendorId }).sort({ CREATED_ON: -1 }).lean();
  return NextResponse.json({ promos });
}

export async function POST(req: NextRequest) {
  const session = await getVendorSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const form = await req.formData();
  const title = form.get("title") as string;
  const code = form.get("code") as string;
  const validFrom = form.get("validFrom") as string;
  const validTo = form.get("validTo") as string;
  const desc = form.get("desc") as string;
  const image = form.get("image") as File | null;

  if (!title || !code || !validFrom || !validTo) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  if (!image || image.size === 0) {
    return NextResponse.json({ error: "Promo Code image is required." }, { status: 400 });
  }

  await dbConnect();
  const filename = await saveAdminUpload(image, "PromoCode");

  await PromoCodeMaster.create({
    PROMO_ID: newStringId(),
    VENDER_ID: session.vendorId,
    PROMO_TITLE: title,
    PROMO_CODE: code,
    PROMO_CODE_IMG: filename,
    PROMO_DESC: desc || "",
    VALID_FROM: new Date(validFrom),
    VALID_TO: new Date(validTo),
    IS_ACTIVE: "Y",
    CREATED_ON: new Date(),
    CREATED_BY: session.vendorId,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
