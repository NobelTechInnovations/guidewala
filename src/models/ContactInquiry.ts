import { Schema, models, model } from "mongoose";

const ContactInquirySchema = new Schema(
  {
    FIRST_NAME: String,
    LAST_NAME: String,
    PHONE: String,
    EMAIL: String,
    SUBJECT: String,
    MESSAGE: String,
    IS_READ: { type: Boolean, default: false },
    CREATED_ON: Date,
  },
  { collection: "contact_inquiries" }
);

export default models.ContactInquiry || model("ContactInquiry", ContactInquirySchema);
