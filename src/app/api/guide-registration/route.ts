import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { GuideDetails } from "@/models";
import { sendTemplateMail } from "@/lib/emailTemplates";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    firstName,
    lastName,
    phoneNo,
    email,
    address1,
    address2,
    city,
    pinCode,
    state,
    country,
    languages,
    expCities,
  } = body as {
    firstName?: string;
    lastName?: string;
    phoneNo?: string;
    email?: string;
    address1?: string;
    address2?: string;
    city?: string;
    pinCode?: string;
    state?: string;
    country?: string;
    languages?: string[];
    expCities?: string[];
  };

  if (!firstName || !phoneNo || !email || !city || !pinCode || !state || !country) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  if (!languages?.length || !expCities?.length) {
    return NextResponse.json({ error: "Please select languages and guide-experience cities." }, { status: 400 });
  }

  await dbConnect();

  const lastGuide = (await GuideDetails.findOne().sort({ GUIDE_ID: -1 }).lean()) as unknown as
    | { GUIDE_ID: number }
    | null;
  const nextGuideId = (lastGuide?.GUIDE_ID || 0) + 1;

  await GuideDetails.create({
    GUIDE_ID: nextGuideId,
    FIRST_NAME: firstName,
    LAST_NAME: lastName || "",
    PHONE_NO: phoneNo,
    EMAIL: email,
    ADDRESS1: address1 || "",
    ADDRESS2: address2 || "",
    CITY: city,
    PIN_CODE: pinCode,
    STATE: state,
    COUNTRY: country,
    LANGUAGE: languages.join(", "),
    EXP_GUIDE_CITIES: expCities.join(", "),
    REGISTRED_ON: new Date(),
    STATUS: "P", // Pending review — matches source flag convention
  });

  const notifyTo = process.env.SEND_PKG_BOOKING_TO || "booking@guidewala.co.in";
  const name = `${firstName} ${lastName || ""}`.trim();
  const address = `${address1 || ""} ${address2 || ""}, ${city}, ${state}, ${country} - ${pinCode}`;

  await sendTemplateMail("GUIDE_REGISTRATION_ADMIN", notifyTo, {
    name,
    phone: phoneNo,
    email,
    address,
    languages: languages.join(", "),
    expCities: expCities.join(", "),
  });

  await sendTemplateMail("GUIDE_REGISTRATION_CUSTOMER", email, { name, email });

  return NextResponse.json({ ok: true });
}
