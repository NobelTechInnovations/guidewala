import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PromoCodeMaster } from "@/models";
import { saveAdminUpload } from "@/lib/upload";
import { getVendorSession } from "@/lib/vendorAuth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getVendorSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const { id } = await params;

  await dbConnect();
  const promo = await PromoCodeMaster.findOne({ PROMO_ID: id, VENDER_ID: session.vendorId }).lean();
  if (!promo) return NextResponse.json({ error: "Promo code not found." }, { status: 404 });
  return NextResponse.json({ promo });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getVendorSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const { id } = await params;

  const form = await req.formData();
  const title = form.get("title") as string;
  const code = form.get("code") as string;
  const validFrom = form.get("validFrom") as string;
  const validTo = form.get("validTo") as string;
  const desc = form.get("desc") as string;
  const isActive = form.get("isActive") as string;
  const image = form.get("image") as File | null;

  await dbConnect();
  const update: Record<string, unknown> = {
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

  // Scoping the filter to VENDER_ID means a vendor can never edit another vendor's promo code,
  // even by guessing a PROMO_ID — the update simply matches nothing.
  const promo = await PromoCodeMaster.findOneAndUpdate(
    { PROMO_ID: id, VENDER_ID: session.vendorId },
    update,
    { returnDocument: "after" }
  ).lean();
  if (!promo) return NextResponse.json({ error: "Promo code not found." }, { status: 404 });
  return NextResponse.json({ promo });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getVendorSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const { id } = await params;

  await dbConnect();
  await PromoCodeMaster.deleteOne({ PROMO_ID: id, VENDER_ID: session.vendorId });
  return NextResponse.json({ ok: true });
}
