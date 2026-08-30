import { Schema, models, model } from "mongoose";

const VendorTypeMasterSchema = new Schema(
  {
    VEN_TYP_ID: { type: Number, index: true },
    VEN_TYP_NAME: String,
    IS_ACTIVE: String,
    CREATED_ON: Date,
  },
  { collection: "vendor_type_master" }
);

export default models.VendorTypeMaster || model("VendorTypeMaster", VendorTypeMasterSchema);
