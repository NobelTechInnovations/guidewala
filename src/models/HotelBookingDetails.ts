import { Schema, models, model } from "mongoose";

const HotelBookingDetailsSchema = new Schema(
  {
    HOTEL_BOOKING_ID: { type: String, index: true },
    CUST_NAME: String,
    PHONE_NO: String,
    WHATSAPP_NO: String,
    EMAIL_ADDRESS: String,
    NO_OF_GUESTS: Number,
    NO_OF_ROOMS: Number,
    HOTEL_CITY: String,
    ROOM_TYPE: String,
    HOTEL_CATEGORY: String,
    ARRIVAL_DATE: Date,
    DEPARTURE_DATE: Date,
    OTHER_INFO: String,
    STATUS: String,
    IS_ACTIVE: String,
    CREATED_ON: Date,
    BOOKING_ID: String,
  },
  { collection: "hotel_booking_details" }
);

export default models.HotelBookingDetails || model("HotelBookingDetails", HotelBookingDetailsSchema);
