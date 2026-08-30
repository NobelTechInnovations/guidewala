import { Schema, models, model } from "mongoose";

const VendorLoginSchema = new Schema(
  {
    VLOG_ID: { type: String, index: true },
    VENDOR_ID: String,
    USER_NAME: String,
    LOGIN_ID: String,
    PASSWORD: String, // plaintext in source system — rehash on migration, see migration script notes
    ROLE: String,
    IS_ACTIVE: String,
    CREATED_ON: Date,
    CREATED_BY: String,
  },
  { collection: "vendor_login" }
);

export default models.VendorLogin || model("VendorLogin", VendorLoginSchema);
