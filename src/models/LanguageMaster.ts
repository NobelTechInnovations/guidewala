import { Schema, models, model } from "mongoose";

const LanguageMasterSchema = new Schema(
  {
    LANG_ID: { type: Number, index: true },
    LANG_NAME: String,
    IS_ACTIVE: String,
    CREATED_ON: Date,
    CREATED_BY: String,
  },
  { collection: "language_master" }
);

export default models.LanguageMaster || model("LanguageMaster", LanguageMasterSchema);
