import { Schema, models, model } from "mongoose";

const TaxiBookingDetailsSchema = new Schema(
  {
    TAXI_BOOKING_ID: { type: String, index: true },
    CUST_NAME: String,
    PHONE_NO: String,
    WHATSAPP_NO: String,
    EMAIL_ADDRESS: String,
    NO_OF_PASSENGERS: Number,
    CITY: String,
    ADDRESS: String,
    DATE_OD_TRAVEL: Date, // typo kept — matches source column name
    TYPE_OF_VEHICLE: String,
    TOUR_PLAN: String,
    STATUS: String,
    CREATED_ON: Date,
    TAXI_ID: String,
  },
  { collection: "taxi_booking_details" }
);

export default models.TaxiBookingDetails || model("TaxiBookingDetails", TaxiBookingDetailsSchema);
