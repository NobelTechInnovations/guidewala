import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { VendorDetails, PromoCodeMaster, VendorCustDetails } from "@/models";
import { getVendorSession } from "@/lib/vendorAuth";

export async function GET(req: NextRequest) {
  const session = await getVendorSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  await dbConnect();
  const [vendor, promoCount, custCount] = await Promise.all([
    VendorDetails.findOne({ VENDOR_ID: session.vendorId }).lean(),
    PromoCodeMaster.countDocuments({ VENDER_ID: session.vendorId }),
    VendorCustDetails.countDocuments({ VENDOR_ID: session.vendorId }),
  ]);
  if (!vendor) return NextResponse.json({ error: "Vendor not found." }, { status: 404 });

  return NextResponse.json({ vendor, promoCount, custCount });
}
