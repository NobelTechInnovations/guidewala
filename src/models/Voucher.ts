import { Schema, models, model } from "mongoose";

// Hotel stay line. Hotel name/address/contact are saved as a snapshot, so a
// voucher still prints correctly after the hotel is renamed or deleted.
const VoucherRowSchema = new Schema(
  {
    HOTEL_ID: Number,
    HOTEL_NAME: { type: String, required: true },
    ADDRESS: String,
    CHECK_IN: { type: Date, required: true },
    CHECK_OUT: { type: Date, required: true },
    SERVICE: String, // "<nights>D/<nights>N" unless edited
    MEAL_PLAN: String, // EP | CP | MAP | AP
    STATUS: String, // Confirm | Pending | Cancelled
    REF_CODE: String,
    CONTACT: String,
  },
  { _id: false }
);

const VoucherSchema = new Schema(
  {
    // GW-V-0001…; the unique index backs the retry on concurrent creates.
    VOUCHER_NO: { type: String, unique: true, index: true },
    GUEST_NAME: { type: String, required: true },
    GUEST_NOTE: String, // e.g. "x 3 Guests (2 Year Child)"
    NATIONALITY: { type: String, default: "Indian" },
    CONTACT_NO: String,
    PAYMENT_TERMS: String, // Prepaid | Pay at Hotel | Partially Paid
    SOURCE: new Schema({ TYPE: String, REF_ID: String }, { _id: false }), // hotel | guide | vendor | manual
    NOTES: String,
    ROWS: [VoucherRowSchema],
    CREATED_ON: { type: Date, default: Date.now },
    UPDATED_ON: { type: Date, default: Date.now },
  },
  { collection: "vouchers" }
);

export default models.Voucher || model("Voucher", VoucherSchema);
