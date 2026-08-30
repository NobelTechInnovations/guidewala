import mongoose, { Schema, models, model } from "mongoose";

const CityMasterSchema = new Schema(
  {
    CITY_ID: { type: String, index: true },
    COUNTRY_ID: String,
    STATE_ID: String,
    CITY_NAME: String,
    IS_ACTIVE: String, // "1" | "0" — matches source SQL flag convention
  },
  { collection: "cities_master" }
);

export default models.CityMaster || model("CityMaster", CityMasterSchema);
