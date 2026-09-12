import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { ContactInquiry } from "@/models";
import { sendTemplateMail } from "@/lib/emailTemplates";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { firstName, lastName, phone, email, subject, message } = body as Record<string, string>;

  if (!firstName || !phone || !email || !subject || !message) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  await dbConnect();
  await ContactInquiry.create({
    FIRST_NAME: firstName,
    LAST_NAME: lastName || "",
    PHONE: phone,
    EMAIL: email,
    SUBJECT: subject,
    MESSAGE: message,
    IS_READ: false,
    CREATED_ON: new Date(),
  });

  const name = `${firstName} ${lastName || ""}`.trim();
  const notifyTo = process.env.SEND_PKG_BOOKING_TO || "booking@guidewala.co.in";

  await sendTemplateMail("CONTACT_ADMIN", notifyTo, { name, phone, email, subject, message });
  await sendTemplateMail("CONTACT_CUSTOMER", email, { name, email, message });

  return NextResponse.json({ ok: true });
}
