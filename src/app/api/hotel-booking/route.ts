import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { HotelBookingDetails } from "@/models";
import { formatBookingId, generateTrackingId } from "@/lib/bookingId";
import { sendMailSafe } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    custName,
    email,
    phoneNo,
    whatsAppNo,
    numberOfGuests,
    numberOfRooms,
    hotelCity,
    roomType,
    hotelCategory,
    arrivalDate,
    departureDate,
    otherInfo,
  } = body as Record<string, string>;

  if (
    !custName ||
    !email ||
    !phoneNo ||
    !numberOfGuests ||
    !numberOfRooms ||
    !roomType ||
    !hotelCategory ||
    !arrivalDate ||
    !departureDate
  ) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  await dbConnect();

  const todayCount = await HotelBookingDetails.countDocuments({
    CREATED_ON: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });
  const hotelBookingId = formatBookingId("HB", todayCount + 1);

  await HotelBookingDetails.create({
    HOTEL_BOOKING_ID: hotelBookingId,
    CUST_NAME: custName,
    PHONE_NO: phoneNo,
    WHATSAPP_NO: whatsAppNo || "",
    EMAIL_ADDRESS: email,
    NO_OF_GUESTS: Number(numberOfGuests),
    NO_OF_ROOMS: Number(numberOfRooms),
    HOTEL_CITY: hotelCity || "",
    ROOM_TYPE: roomType,
    HOTEL_CATEGORY: hotelCategory,
    ARRIVAL_DATE: new Date(arrivalDate),
    DEPARTURE_DATE: new Date(departureDate),
    OTHER_INFO: otherInfo || "",
    STATUS: "P", // Pending — reviewed manually, matches source flag convention
    IS_ACTIVE: "1",
    CREATED_ON: new Date(),
    BOOKING_ID: generateTrackingId("GWT"),
  });

  const notifyTo = process.env.SEND_PKG_BOOKING_TO || "booking@guidewala.co.in";
  await sendMailSafe({
    to: notifyTo,
    subject: `New Hotel Booking Enquiry — ${hotelBookingId}`,
    html: `
      <h3>New Hotel Booking Enquiry</h3>
      <p><strong>Booking ID:</strong> ${hotelBookingId}</p>
      <p><strong>Name:</strong> ${custName}</p>
      <p><strong>Phone:</strong> ${phoneNo} ${whatsAppNo ? `(alt: ${whatsAppNo})` : ""}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>City:</strong> ${hotelCity || "—"}</p>
      <p><strong>Guests / Rooms:</strong> ${numberOfGuests} / ${numberOfRooms}</p>
      <p><strong>Room Type:</strong> ${roomType}</p>
      <p><strong>Category:</strong> ${hotelCategory}</p>
      <p><strong>Arrival:</strong> ${arrivalDate} &nbsp; <strong>Departure:</strong> ${departureDate}</p>
      <p><strong>Other Info:</strong> ${otherInfo || "—"}</p>
    `,
  });

  return NextResponse.json({ ok: true, bookingId: hotelBookingId });
}
