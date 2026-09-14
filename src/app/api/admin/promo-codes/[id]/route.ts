import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PromoCodeMaster } from "@/models";
import { saveAdminUpload } from "@/lib/upload";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  const promo = await PromoCodeMaster.findOne({ PROMO_ID: id }).lean();
  if (!promo) return NextResponse.json({ error: "Promo code not found." }, { status: 404 });
  return NextResponse.json({ promo });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await req.formData();
  const vendorId = form.get("vendorId") as string;
  const title = form.get("title") as string;
  const code = form.get("code") as string;
  const validFrom = form.get("validFrom") as string;
  const validTo = form.get("validTo") as string;
  const desc = form.get("desc") as string;
  const isActive = form.get("isActive") as string;
  const image = form.get("image") as File | null;

  await dbConnect();
  const update: Record<string, unknown> = {
    VENDER_ID: vendorId,
    PROMO_TITLE: title,
    PROMO_CODE: code,
    VALID_FROM: new Date(validFrom),
    VALID_TO: new Date(validTo),
    PROMO_DESC: desc || "",
    IS_ACTIVE: isActive,
  };
  if (image && image.size > 0) {
    update.PROMO_CODE_IMG = await saveAdminUpload(image, "PromoCode");
  }

  const promo = await PromoCodeMaster.findOneAndUpdate({ PROMO_ID: id }, update, { returnDocument: "after" }).lean();
  if (!promo) return NextResponse.json({ error: "Promo code not found." }, { status: 404 });
  return NextResponse.json({ promo });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  await PromoCodeMaster.deleteOne({ PROMO_ID: id });
  return NextResponse.json({ ok: true });
}
