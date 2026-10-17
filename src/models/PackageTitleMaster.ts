import { Schema, models, model } from "mongoose";

// One stop on the route chips ("Jaipur · 2N"). No _id: it's a display row.
const RouteStopSchema = new Schema(
  {
    CITY: String,
    NIGHTS: Number,
  },
  { _id: false }
);

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

    // Rich-package fields. All optional: legacy documents have none of them.
    DURATION_DAYS: Number,
    DURATION_NIGHTS: Number,
    ROUTE: [RouteStopSchema],
    TOUR_TYPE: String, // Private Tour | Group Tour | Guide Only
    PRICE_NOTE: String, // e.g. "per person on twin sharing"
    GALLERY: [String], // filenames in pkgGallery/
    INCLUDES: [String], // subset of Hotel, Meals, Transport, Sightseeing, Guide, Flight
    HIGHLIGHTS: [String],
    INCLUSIONS: [String],
    EXCLUSIONS: [String],
    DOCUMENTS: [String],
    THINGS_TO_CARRY: [String],
    NOTES: [String],
    BROCHURE: String, // PDF filename in pkgBrochure/
    CANCELLATION_POLICY: String, // blank = site default
    SHOW_ON_HOME: String, // "Y" | "N", missing = shown
  },
  { collection: "package_title_master" }
);

export default models.PackageTitleMaster || model("PackageTitleMaster", PackageTitleMasterSchema);
