import { Schema, models, model } from "mongoose";

const PkgBookingDetailsSchema = new Schema(
  {
    BOOLING_ID: { type: String, index: true }, // typo kept intentionally — matches source column name
    DOS: Date, // Date Of Service
    TOGR: String, // Time Of Guide Requirement
    HOGR: Number, // Hours Of Guide Requirement
    OTHER_HOGR: String,
    GUIDE_LANGUAGE: String,
    NO_OF_PASSENGERS: Number,
    EXISTING_CUST: String,
    CUST_NAME: String,
    PHONE_NO: String,
    WHATSAPP_NO: String,
    EMAIL_ADDRESS: String,
    CUST_MSG: String,
    PKG_ID: Number,
    PROMO_ID: String,
    BOOKING_AMOUNT: Number,
    BOOKING_DATE: Date,
    BOOKING_STATUS: String,
    PAYMENT_ID: String,
    PAYMENT_STATUS: String,
    TRANSACTION_ID: String,
    ALLOTTED_GUIDE_ID: Number,
    ALLOTTED_GUIDE_DATE_TIME: Date,
    ALLOTTED_GUIDE_BY: String,
  },
  { collection: "pkg_booking_details" }
);

export default models.PkgBookingDetails || model("PkgBookingDetails", PkgBookingDetailsSchema);
