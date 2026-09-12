import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { VendorCustDetails } from "@/models";
import { newStringId } from "@/lib/ids";
import { getVendorSession } from "@/lib/vendorAuth";

export async function GET(req: NextRequest) {
  const session = await getVendorSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  await dbConnect();
  const customers = await VendorCustDetails.find({ VENDOR_ID: session.vendorId }).sort({ CREATED_ON: -1 }).lean();
  return NextResponse.json({ customers });
}

export async function POST(req: NextRequest) {
  const session = await getVendorSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { custName, phone1, phone2, email, stayFrom, stayTo, address } = (await req.json()) as Record<string, string>;
  if (!custName || !phone1 || !stayFrom || !stayTo || !address) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  await dbConnect();
  await VendorCustDetails.create({
    CUST_ID: newStringId(),
    VENDOR_ID: session.vendorId,
    CUST_NAME: custName,
    PHONE_NO1: phone1,
    PHONE_NO2: phone2 || "",
    EMAIL: email || "",
    STAY_FROM_DT: new Date(stayFrom),
    STAY_TO_DT: new Date(stayTo),
    ADDRESS: address,
    IS_ACTIVE: "Y",
    CREATED_ON: new Date(),
    CREATED_BY: session.vendorId,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
