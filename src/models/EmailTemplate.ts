import { Schema, models, model } from "mongoose";

const EmailTemplateSchema = new Schema(
  {
    KEY: { type: String, index: true, unique: true },
    LABEL: String, // human-readable name shown in the admin UI
    DESCRIPTION: String, // when this template is used
    SUBJECT: String,
    BODY_HTML: String,
    VARIABLES: [String], // available {{placeholders}} for this template, shown as a reference in the editor
    UPDATED_ON: Date,
  },
  { collection: "email_templates" }
);

export default models.EmailTemplate || model("EmailTemplate", EmailTemplateSchema);
