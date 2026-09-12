import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { PkgBookingDetails } from "@/models";
import { formatBookingId } from "@/lib/bookingId";
import { sendTemplateMail } from "@/lib/emailTemplates";

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

  await sendTemplateMail("GUIDE_BOOKING_ADMIN", notifyTo, {
    bookingId,
    pkgId,
    bookingAmount,
    name: custName,
    phone: whatsAppNo ? `${phoneNo} (alt: ${whatsAppNo})` : phoneNo,
    email,
    dateOfSightseeing,
    timeOfReporting,
    reportingHotel,
    guideLanguage,
    numberOfPersons,
    message,
  });

  await sendTemplateMail("GUIDE_BOOKING_CUSTOMER", String(email), { name: custName, email, bookingId });

  return NextResponse.json({ ok: true, bookingId });
}
