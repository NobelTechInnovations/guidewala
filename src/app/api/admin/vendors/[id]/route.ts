import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { VendorDetails, VendorLogin, VendorTypeMaster, CityMaster, StateMaster, CountryMaster } from "@/models";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  const [vendor, login] = await Promise.all([
    VendorDetails.findOne({ VENDOR_ID: id }).lean(),
    VendorLogin.findOne({ VENDOR_ID: id }).lean(),
  ]);
  if (!vendor) return NextResponse.json({ error: "Vendor not found." }, { status: 404 });

  const [type, city, state, country] = await Promise.all([
    VendorTypeMaster.findOne({ VEN_TYP_ID: vendor.VEN_TYP_ID }).select("VEN_TYP_NAME -_id").lean(),
    CityMaster.findOne({ CITY_ID: vendor.CITY_ID }).select("CITY_NAME -_id").lean(),
    StateMaster.findOne({ STATE_ID: vendor.STATE_ID }).select("STATE_NAME -_id").lean(),
    CountryMaster.findOne({ COUNTRY_ID: vendor.COUNTRY_ID }).select("COUNTRY_NAME -_id").lean(),
  ]);

  return NextResponse.json({
    vendor: {
      ...vendor,
      VEN_TYP_NAME: type?.VEN_TYP_NAME || "",
      CITY_NAME: city?.CITY_NAME || "",
      STATE_NAME: state?.STATE_NAME || "",
      COUNTRY_NAME: country?.COUNTRY_NAME || "",
    },
    login,
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  await dbConnect();
  const vendor = await VendorDetails.findOneAndUpdate(
    { VENDOR_ID: id },
    {
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
      IS_ACTIVE: isActive,
    },
    { new: true }
  ).lean();
  if (!vendor) return NextResponse.json({ error: "Vendor not found." }, { status: 404 });

  const loginUpdate: Record<string, string> = { USER_NAME: userName, LOGIN_ID: loginId, IS_ACTIVE: loginActive };
  if (password) loginUpdate.PASSWORD = password;
  await VendorLogin.findOneAndUpdate({ VENDOR_ID: id }, loginUpdate);

  return NextResponse.json({ vendor });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  await Promise.all([VendorDetails.deleteOne({ VENDOR_ID: id }), VendorLogin.deleteOne({ VENDOR_ID: id })]);
  return NextResponse.json({ ok: true });
}
