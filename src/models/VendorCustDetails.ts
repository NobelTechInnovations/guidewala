import { Schema, models, model } from "mongoose";

const VendorCustDetailsSchema = new Schema(
  {
    CUST_ID: { type: String, index: true },
    VENDOR_ID: String,
    CUST_NAME: String,
    PHONE_NO1: String,
    PHONE_NO2: String,
    EMAIL: String,
    STAY_FROM_DT: Date,
    STAY_TO_DT: Date,
    ADDRESS: String,
    IS_ACTIVE: String,
    CREATED_ON: Date,
    CREATED_BY: String,
  },
  { collection: "vendor_cust_details" }
);

export default models.VendorCustDetails || model("VendorCustDetails", VendorCustDetailsSchema);
