import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { VendorDetails, VendorTypeMaster, CityMaster, StateMaster, VendorLogin } from "@/models";
import { newStringId } from "@/lib/ids";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = req.nextUrl;
  const state = searchParams.get("state");
  const city = searchParams.get("city");
  const status = searchParams.get("status");

  const filter: Record<string, unknown> = {};
  if (state) filter.STATE_ID = state;
  if (city) filter.CITY_ID = city;
  if (status && status !== "ALL") filter.IS_ACTIVE = status;

  const [vendors, types, cities, states] = await Promise.all([
    VendorDetails.find(filter).sort({ CREATED_ON: -1 }).lean(),
    VendorTypeMaster.find({}).select("VEN_TYP_ID VEN_TYP_NAME -_id").lean(),
    CityMaster.find({}).select("CITY_ID CITY_NAME -_id").lean(),
    StateMaster.find({}).select("STATE_ID STATE_NAME -_id").lean(),
  ]);

  const typeMap = new Map(types.map((t) => [t.VEN_TYP_ID, t.VEN_TYP_NAME]));
  const cityMap = new Map(cities.map((c) => [c.CITY_ID, c.CITY_NAME]));
  const stateMap = new Map(states.map((s) => [s.STATE_ID, s.STATE_NAME]));

  const result = vendors.map((v) => ({
    ...v,
    VEN_TYP_NAME: typeMap.get(v.VEN_TYP_ID) || "",
    CITY_NAME: cityMap.get(v.CITY_ID) || "",
    STATE_NAME: stateMap.get(v.STATE_ID) || "",
  }));

  return NextResponse.json({ vendors: result });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    companyName,
    venTypId,
    address1,
    address2,
    contactPerson,
    email1,
    email2,
    phone1,
    phone2,
    website,
    cityId,
    stateId,
    countryId,
    pinCode,
    isActive,
    userName,
    loginId,
    password,
    loginActive,
  } = body as Record<string, string>;

  if (!companyName || !address1 || !contactPerson || !email1 || !phone1 || !cityId || !stateId || !countryId) {
    return NextResponse.json({ error: "Please fill in all required company fields." }, { status: 400 });
  }
  if (!userName || !loginId || !password) {
    return NextResponse.json({ error: "Please fill in all required login fields." }, { status: 400 });
  }

  await dbConnect();
  const vendorId = newStringId();

  await VendorDetails.create({
    VENDOR_ID: vendorId,
    COMPANY_NAME: companyName,
    VEN_TYP_ID: venTypId ? Number(venTypId) : undefined,
    ADDRESS1: address1,
    ADDRESS2: address2 || "",
    CONTACT_PERSON: contactPerson,
    EMAIL1: email1,
    EMAIL2: email2 || "",
    PHONENO1: phone1,
    PHONENO2: phone2 || "",
    WEBSITE: website || "",
    CITY_ID: cityId,
    STATE_ID: stateId,
    COUNTRY_ID: countryId,
    PINCODE: pinCode || "",
    IS_ACTIVE: isActive || "Y",
    CREATED_ON: new Date(),
    CREATED_BY: "admin",
  });

  await VendorLogin.create({
    VLOG_ID: newStringId(),
    VENDOR_ID: vendorId,
    USER_NAME: userName,
    LOGIN_ID: loginId,
    PASSWORD: password,
    ROLE: "VENDOR",
    IS_ACTIVE: loginActive || "Y",
    CREATED_ON: new Date(),
    CREATED_BY: "admin",
  });

  return NextResponse.json({ vendorId }, { status: 201 });
}
