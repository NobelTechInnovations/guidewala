import { Schema, models, model } from "mongoose";

const CouponSendToMailSchema = new Schema(
  {
    ID: { type: Number, index: true },
    PROMO_ID: String,
    NAME: String,
    PHONE_NO: String,
    EMAIL: String,
    CREATED_ON: Date,
  },
  { collection: "coupon_send_to_mail" }
);

export default models.CouponSendToMail || model("CouponSendToMail", CouponSendToMailSchema);
