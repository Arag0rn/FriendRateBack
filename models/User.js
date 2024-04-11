import { Schema, model } from "mongoose";
import { handleSaveError, preUpdate } from "./hooks.js";

const userSchema = new Schema(
  {
  
    password: {
      type: String,
      required: [true, "Set password for user"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      // required: [true, 'Gender is required'],
    },
    avatarURL: {
      type: String,
    },
    language: {
      type: String,
      enum: ["en", "ukr"],
    },
    about: {
      type: String,
    },
    username: {
      type: String,
      // required: [true, 'Set username for user'],
    },
    birthday: {
      type: String,
      // required: [true, 'Birthday is required'],
    },
    verify: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: ["google", "facebook", "form"],
    },

    verificationToken: {
      type: String,
    },
    token: String,
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleSaveError);

userSchema.pre("findOneAndUpdate", preUpdate);

userSchema.post("findOneAndUpdate", handleSaveError);

const User = model("user", userSchema);

export default User;
