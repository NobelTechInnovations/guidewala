import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { VendorCustDetails, VendorDetails } from "@/models";
import { newStringId } from "@/lib/ids";

export async function GET(req: NextRequest) {
  await dbConnect();
  const vendorId = req.nextUrl.searchParams.get("vendorId");

  const filter: Record<string, string> = {};
  if (vendorId) filter.VENDOR_ID = vendorId;

  const [customers, vendors] = await Promise.all([
    VendorCustDetails.find(filter).sort({ CREATED_ON: -1 }).lean(),
    VendorDetails.find({}).select("VENDOR_ID COMPANY_NAME -_id").lean(),
  ]);
  const vendorMap = new Map(vendors.map((v) => [v.VENDOR_ID, v.COMPANY_NAME]));

  return NextResponse.json({
    customers: customers.map((c) => ({ ...c, VENDOR_NAME: vendorMap.get(c.VENDOR_ID) || "" })),
    vendors,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { vendorId, custName, phone1, phone2, email, stayFrom, stayTo, address } = body as Record<string, string>;

  if (!vendorId || !custName || !phone1 || !stayFrom || !stayTo || !address) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  await dbConnect();
  await VendorCustDetails.create({
    CUST_ID: newStringId(),
    VENDOR_ID: vendorId,
    CUST_NAME: custName,
    PHONE_NO1: phone1,
    PHONE_NO2: phone2 || "",
    EMAIL: email || "",
    STAY_FROM_DT: new Date(stayFrom),
    STAY_TO_DT: new Date(stayTo),
    ADDRESS: address,
    IS_ACTIVE: "Y",
    CREATED_ON: new Date(),
    CREATED_BY: "admin",
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
