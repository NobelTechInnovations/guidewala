import { NextRequest, NextResponse } from "next/server";
import { sendMailSafe } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { firstName, lastName, phone, email, subject, message } = body as Record<string, string>;

  if (!firstName || !phone || !email || !subject || !message) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  const notifyTo = process.env.SEND_PKG_BOOKING_TO || "booking@guidewala.co.in";
  await sendMailSafe({
    to: notifyTo,
    subject: `Contact form: ${subject}`,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${firstName} ${lastName || ""}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
