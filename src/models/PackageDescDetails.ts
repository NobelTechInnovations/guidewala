import { Schema, models, model } from "mongoose";

const PackageDescDetailsSchema = new Schema(
  {
    ID: { type: Number, index: true },
    PKG_ID: { type: Number, index: true },
    ITINERARY: String,
    PACKAGE_DESC: String,
    PKG_IMAGE: String,

    // Rich-itinerary fields. All optional: legacy documents have none of them.
    DAY_NO: Number, // blank = not day-wise
    MEALS: [String], // subset of Breakfast, Lunch, Dinner
    STAY: String, // overnight location/hotel
    IS_ACTIVE: String, // "Y" | "N", missing = shown
  },
  { collection: "package_desc_details" }
);

export default models.PackageDescDetails || model("PackageDescDetails", PackageDescDetailsSchema);
