import { Schema, models, model } from "mongoose";

const StateMasterSchema = new Schema(
  {
    STATE_ID: { type: String, index: true },
    COUNTRY_ID: String,
    STATE_NAME: String,
    IS_ACTIVE: String,
  },
  { collection: "states_master" }
);

export default models.StateMaster || model("StateMaster", StateMasterSchema);
