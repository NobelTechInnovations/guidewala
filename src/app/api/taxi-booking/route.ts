import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { TaxiBookingDetails } from "@/models";
import { formatBookingId, generateTrackingId } from "@/lib/bookingId";
import { sendMailSafe } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    custName,
    email,
    phoneNo,
    whatsAppNo,
    numberOfPersons,
    city,
    address,
    dateOfTravel,
    vehicleType,
    tourPlan,
  } = body as Record<string, string>;

  if (!custName || !email || !phoneNo || !numberOfPersons || !city || !address || !dateOfTravel || !vehicleType) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  await dbConnect();

  const todayCount = await TaxiBookingDetails.countDocuments({
    CREATED_ON: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });
  const taxiBookingId = formatBookingId("TB", todayCount + 1);

  await TaxiBookingDetails.create({
    TAXI_BOOKING_ID: taxiBookingId,
    CUST_NAME: custName,
    PHONE_NO: phoneNo,
    WHATSAPP_NO: whatsAppNo || "",
    EMAIL_ADDRESS: email,
    NO_OF_PASSENGERS: Number(numberOfPersons),
    CITY: city,
    ADDRESS: address,
    DATE_OD_TRAVEL: new Date(dateOfTravel),
    TYPE_OF_VEHICLE: vehicleType,
    TOUR_PLAN: tourPlan || "",
    STATUS: "P", // Pending — reviewed manually, matches source flag convention
    CREATED_ON: new Date(),
    TAXI_ID: generateTrackingId("GWT"),
  });

  const notifyTo = process.env.SEND_PKG_BOOKING_TO || "booking@guidewala.co.in";
  await sendMailSafe({
    to: notifyTo,
    subject: `New Taxi Booking Enquiry — ${taxiBookingId}`,
    html: `
      <h3>New Taxi Booking Enquiry</h3>
      <p><strong>Booking ID:</strong> ${taxiBookingId}</p>
      <p><strong>Name:</strong> ${custName}</p>
      <p><strong>Phone:</strong> ${phoneNo} ${whatsAppNo ? `(alt: ${whatsAppNo})` : ""}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>City:</strong> ${city}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Date of Travel:</strong> ${dateOfTravel}</p>
      <p><strong>Vehicle:</strong> ${vehicleType}</p>
      <p><strong>Passengers:</strong> ${numberOfPersons}</p>
      <p><strong>Tour Plan:</strong> ${tourPlan || "—"}</p>
    `,
  });

  return NextResponse.json({ ok: true, bookingId: taxiBookingId });
}
