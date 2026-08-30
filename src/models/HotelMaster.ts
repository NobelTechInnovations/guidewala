import { Schema, models, model } from "mongoose";

const HotelMasterSchema = new Schema(
  {
    HOTEL_ID: { type: Number, index: true },
    HOTEL_NAME: String,
    CITY_ID: String,
    IS_ACTIVE: String,
    CREATED_ON: Date,
  },
  { collection: "hotel_master" }
);

export default models.HotelMaster || model("HotelMaster", HotelMasterSchema);
