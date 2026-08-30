import { Schema, models, model } from "mongoose";

const PackageTitleMasterSchema = new Schema(
  {
    PKG_ID: { type: Number, index: true },
    TITLE_NAME: String,
    CITY_ID: String,
    PKG_AMOUNT: Number,
    PKG_IMAGE: String, // filename
    IS_ACTIVE: String,
    CREATED_ON: Date,
    PKG_DESC: String,
  },
  { collection: "package_title_master" }
);

export default models.PackageTitleMaster || model("PackageTitleMaster", PackageTitleMasterSchema);
