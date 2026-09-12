import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { HotelBookingDetails } from "@/models";
import { formatBookingId, generateTrackingId } from "@/lib/bookingId";
import { sendTemplateMail } from "@/lib/emailTemplates";

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

  await sendTemplateMail("HOTEL_BOOKING_ADMIN", notifyTo, {
    bookingId: hotelBookingId,
    name: custName,
    phone: whatsAppNo ? `${phoneNo} (alt: ${whatsAppNo})` : phoneNo,
    email,
    city: hotelCity,
    numberOfGuests,
    numberOfRooms,
    roomType,
    hotelCategory,
    arrivalDate,
    departureDate,
    otherInfo,
  });

  await sendTemplateMail("HOTEL_BOOKING_CUSTOMER", email, { name: custName, email, bookingId: hotelBookingId });

  return NextResponse.json({ ok: true, bookingId: hotelBookingId });
}
