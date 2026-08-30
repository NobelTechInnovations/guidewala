import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PkgBookingDetails } from "@/models";
import { formatBookingId } from "@/lib/bookingId";
import { sendMailSafe } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    dateOfSightseeing,
    timeOfReporting,
    hotelOfReporting,
    otherHotel,
    guideLanguage,
    numberOfPersons,
    existingCustomer,
    custName,
    phoneNo,
    whatsAppNo,
    email,
    message,
    pkgId,
    bookingAmount,
  } = body as Record<string, string | number>;

  if (
    !dateOfSightseeing ||
    !timeOfReporting ||
    !numberOfPersons ||
    !existingCustomer ||
    !custName ||
    !phoneNo ||
    !email
  ) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  await dbConnect();

  const todayCount = await PkgBookingDetails.countDocuments({
    BOOKING_DATE: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });
  const bookingId = formatBookingId("GW", todayCount + 1);

  const reportingHotel = hotelOfReporting === "Other" ? String(otherHotel || "") : String(hotelOfReporting || "");

  await PkgBookingDetails.create({
    BOOLING_ID: bookingId,
    DOS: new Date(dateOfSightseeing as string),
    TOGR: timeOfReporting,
    HOGR: 0,
    OTHER_HOGR: reportingHotel,
    GUIDE_LANGUAGE: guideLanguage,
    NO_OF_PASSENGERS: Number(numberOfPersons),
    EXISTING_CUST: existingCustomer,
    CUST_NAME: custName,
    PHONE_NO: phoneNo,
    WHATSAPP_NO: whatsAppNo || "",
    EMAIL_ADDRESS: email,
    CUST_MSG: message || "",
    PKG_ID: Number(pkgId),
    BOOKING_AMOUNT: Number(bookingAmount) || 0,
    BOOKING_DATE: new Date(),
    BOOKING_STATUS: "P", // Pending — no payment gateway; confirmed manually, matches source flag convention
    PAYMENT_STATUS: "PENDING",
  });

  const notifyTo = process.env.SEND_PKG_BOOKING_TO || "booking@guidewala.co.in";
  await sendMailSafe({
    to: notifyTo,
    subject: `New Guide Booking — ${bookingId}`,
    html: `
      <h3>New Guide Booking Request</h3>
      <p><strong>Booking ID:</strong> ${bookingId}</p>
      <p><strong>Package ID:</strong> ${pkgId} &nbsp; <strong>Amount:</strong> ₹${bookingAmount}</p>
      <p><strong>Name:</strong> ${custName}</p>
      <p><strong>Phone:</strong> ${phoneNo} ${whatsAppNo ? `(alt: ${whatsAppNo})` : ""}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Date of Sightseeing:</strong> ${dateOfSightseeing} at ${timeOfReporting}</p>
      <p><strong>Hotel of Reporting:</strong> ${reportingHotel || "—"}</p>
      <p><strong>Guide Language:</strong> ${guideLanguage}</p>
      <p><strong>Passengers:</strong> ${numberOfPersons}</p>
      <p><strong>Existing Customer:</strong> ${existingCustomer === "Y" ? "Yes" : "No"}</p>
      <p><strong>Message:</strong> ${message || "—"}</p>
    `,
  });

  await sendMailSafe({
    to: String(email),
    subject: `Guidewala booking received — ${bookingId}`,
    html: `
      <p>Hi ${custName},</p>
      <p>Thanks for booking with Guidewala! Your booking reference is <strong>${bookingId}</strong>.</p>
      <p>Our team will confirm your guide shortly. Payment is collected in advance via Google Pay / UPI —
      we'll share the details on WhatsApp.</p>
      <p>— Team Guidewala</p>
    `,
  });

  return NextResponse.json({ ok: true, bookingId });
}
