import { Schema, models, model } from "mongoose";

const PromoCodeMasterSchema = new Schema(
  {
    PROMO_ID: { type: String, index: true },
    VENDER_ID: String,
    PROMO_TITLE: String,
    PROMO_CODE: String,
    PROMO_CODE_IMG: String,
    PROMO_DESC: String,
    VALID_FROM: Date,
    VALID_TO: Date,
    IS_ACTIVE: String,
    CREATED_ON: Date,
    CREATED_BY: String,
  },
  { collection: "promo_code_master" }
);

export default models.PromoCodeMaster || model("PromoCodeMaster", PromoCodeMasterSchema);
