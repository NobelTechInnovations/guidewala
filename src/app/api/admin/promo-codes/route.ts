import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PromoCodeMaster, VendorDetails } from "@/models";
import { newStringId } from "@/lib/ids";
import { saveAdminUpload } from "@/lib/upload";

export async function GET() {
  await dbConnect();
  const [promos, vendors] = await Promise.all([
    PromoCodeMaster.find({}).sort({ CREATED_ON: -1 }).lean(),
    VendorDetails.find({}).select("VENDOR_ID COMPANY_NAME -_id").lean(),
  ]);
  const vendorMap = new Map(vendors.map((v) => [v.VENDOR_ID, v.COMPANY_NAME]));
  return NextResponse.json({
    promos: promos.map((p) => ({ ...p, VENDOR_NAME: vendorMap.get(p.VENDER_ID) || "" })),
    vendors,
  });
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const vendorId = form.get("vendorId") as string;
  const title = form.get("title") as string;
  const code = form.get("code") as string;
  const validFrom = form.get("validFrom") as string;
  const validTo = form.get("validTo") as string;
  const desc = form.get("desc") as string;
  const isActive = (form.get("isActive") as string) || "Y";
  const image = form.get("image") as File | null;

  if (!vendorId || !title || !code || !validFrom || !validTo) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  if (!image || image.size === 0) {
    return NextResponse.json({ error: "Promo Code image is required." }, { status: 400 });
  }

  await dbConnect();
  const filename = await saveAdminUpload(image, "PromoCode");

  await PromoCodeMaster.create({
    PROMO_ID: newStringId(),
    VENDER_ID: vendorId,
    PROMO_TITLE: title,
    PROMO_CODE: code,
    PROMO_CODE_IMG: filename,
    PROMO_DESC: desc || "",
    VALID_FROM: new Date(validFrom),
    VALID_TO: new Date(validTo),
    IS_ACTIVE: isActive,
    CREATED_ON: new Date(),
    CREATED_BY: "admin",
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
