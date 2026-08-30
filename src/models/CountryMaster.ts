import { Schema, models, model } from "mongoose";

const CountryMasterSchema = new Schema(
  {
    COUNTRY_ID: { type: String, index: true },
    COUNTRY_NAME: String,
    IS_ACTIVE: String,
  },
  { collection: "country_master" }
);

export default models.CountryMaster || model("CountryMaster", CountryMasterSchema);
