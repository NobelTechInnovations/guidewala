import { Schema, models, model } from "mongoose";

const UsersLoginSchema = new Schema(
  {
    COMP_ID: String,
    USER_ID: { type: String, index: true },
    FULL_NAME: String,
    EMAIL_ID: String,
    LOGIN_ID: String,
    PWD: String, // plaintext in source system — rehash on migration, see migration script notes
    PROFILE: String,
    IS_ACTIVE: String,
    ADD_STAMP: Date,
  },
  { collection: "users_login" }
);

export default models.UsersLogin || model("UsersLogin", UsersLoginSchema);
