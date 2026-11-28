import { Schema, models, model } from "mongoose";

/** Short enquiry from a tour package page (name, phone, travel date, persons) + the package it came from. */
const TourInquirySchema = new Schema(
  {
    NAME: String,
    PHONE: String,
    TRAVEL_DATE: Date,
    NO_OF_PERSONS: Number,
    PKG_ID: Number,
    PKG_TITLE: String,
    PKG_URL: String, // full link to the package page the customer enquired from
    IS_READ: { type: Boolean, default: false },
    CREATED_ON: { type: Date, index: true },
  },
  { collection: "tour_inquiries" }
);

export default models.TourInquiry || model("TourInquiry", TourInquirySchema);
