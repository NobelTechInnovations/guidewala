import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PromoCodeMaster, VendorDetails, CityMaster } from "@/models";

const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE || "https://admin.guidewala.co.in/";

// Public read-only endpoint — all coupons with vendor/city info attached,
// matching the web app's /coupons page.
export async function GET() {
  await dbConnect();

  const promos = await PromoCodeMaster.find({}).sort({ CREATED_ON: -1 }).lean();
  const vendorIds = [...new Set(promos.map((p) => p.VENDER_ID))];

  const [vendors, cities] = await Promise.all([
    VendorDetails.find({ VENDOR_ID: { $in: vendorIds } })
      .select("VENDOR_ID COMPANY_NAME ADDRESS1 WEBSITE CITY_ID -_id")
      .lean(),
    CityMaster.find({}).select("CITY_ID CITY_NAME -_id").lean(),
  ]);

  const vendorMap = new Map(vendors.map((v) => [v.VENDOR_ID, v]));
  const cityMap = new Map(cities.map((c) => [c.CITY_ID, c.CITY_NAME]));

  const coupons = promos.map((p) => {
    const vendor = vendorMap.get(p.VENDER_ID);
    return {
      promoId: p.PROMO_ID,
      title: p.PROMO_TITLE,
      code: p.PROMO_CODE,
      image: `${IMG_BASE}img/PromoCode/${p.PROMO_CODE_IMG}`,
      description: p.PROMO_DESC,
      validFrom: p.VALID_FROM,
      validTo: p.VALID_TO,
      isActive: p.IS_ACTIVE === "Y",
      companyName: vendor?.COMPANY_NAME || "",
      address: vendor?.ADDRESS1 || "",
      website: vendor?.WEBSITE || "",
      cityName: vendor ? cityMap.get(vendor.CITY_ID) || "" : "",
    };
  });

  return NextResponse.json({ coupons });
}
