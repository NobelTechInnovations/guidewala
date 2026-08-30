import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { GuideDetails } from "@/models";
import { sendMailSafe } from "@/lib/mailer";

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
  await sendMailSafe({
    to: notifyTo,
    subject: `New Guide Registration — ${firstName} ${lastName || ""}`,
    html: `
      <h3>New Guide Registration</h3>
      <p><strong>Name:</strong> ${firstName} ${lastName || ""}</p>
      <p><strong>Phone:</strong> ${phoneNo}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Address:</strong> ${address1 || ""} ${address2 || ""}, ${city}, ${state}, ${country} - ${pinCode}</p>
      <p><strong>Languages:</strong> ${languages.join(", ")}</p>
      <p><strong>Experience Cities:</strong> ${expCities.join(", ")}</p>
      <p>Next step: reach out to collect license &amp; ID proof for verification.</p>
    `,
  });

  await sendMailSafe({
    to: email,
    subject: "Guidewala — Registration received",
    html: `
      <p>Hi ${firstName},</p>
      <p>Thanks for registering as a guide with Guidewala! Our team will review your details and
      reach out shortly to collect your license and ID proof for verification.</p>
      <p>— Team Guidewala</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
