import { Schema, models, model } from "mongoose";

const VendorDetailsSchema = new Schema(
  {
    VENDOR_ID: { type: String, index: true },
    COMPANY_NAME: String,
    VEN_TYP_ID: Number,
    EMAIL1: String,
    EMAIL2: String,
    PHONENO1: String,
    PHONENO2: String,
    WEBSITE: String,
    CONTACT_PERSON: String,
    ADDRESS1: String,
    ADDRESS2: String,
    CITY_ID: String,
    STATE_ID: String,
    PINCODE: String,
    COUNTRY_ID: String,
    IS_ACTIVE: String,
    CREATED_ON: Date,
    CREATED_BY: String,
  },
  { collection: "vendor_details" }
);

export default models.VendorDetails || model("VendorDetails", VendorDetailsSchema);
