import { Schema, models, model } from "mongoose";

const GuideDetailsSchema = new Schema(
  {
    GUIDE_ID: { type: Number, index: true },
    FIRST_NAME: String,
    LAST_NAME: String,
    PHONE_NO: String,
    EMAIL: String,
    ADDRESS1: String,
    ADDRESS2: String,
    CITY: String,
    PIN_CODE: String,
    STATE: String,
    COUNTRY: String,
    LANGUAGE: String, // comma-separated language IDs/names, as in source
    EXP_GUIDE_CITIES: String, // comma-separated city list
    GUIDE_PHOTO: String, // filename — resolved against imgPath at render time
    GUIDE_LICENSE: String, // filename
    GUIDE_DESC: String,
    PAN_NO: String,
    BANK_DETAILS: String,
    REGISTRED_ON: Date,
    STATUS: String, // "P" pending / "A" approved / "R" rejected — matches source flag convention
    ACTION_ON: Date,
  },
  { collection: "guide_details" }
);

export default models.GuideDetails || model("GuideDetails", GuideDetailsSchema);
