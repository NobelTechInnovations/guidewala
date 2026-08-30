import { Schema, models, model } from "mongoose";

const PackageDescDetailsSchema = new Schema(
  {
    ID: { type: Number, index: true },
    PKG_ID: { type: Number, index: true },
    ITINERARY: String,
    PACKAGE_DESC: String,
    PKG_IMAGE: String,
  },
  { collection: "package_desc_details" }
);

export default models.PackageDescDetails || model("PackageDescDetails", PackageDescDetailsSchema);
