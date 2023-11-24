import Joi from "joi";
import { Schema, model } from "mongoose";
import { handleSaveError, runValidators } from "./hooks.js";

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const genderList = ["male", "female"];

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      match: emailRegexp,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      minlength: 8,
      maxlength: 64,
      required: true,
    },
    gender: {
      type: String,
      enum: genderList,
      default: genderList[0],
    },
    avatarURL: {
      type: String,
    },
    waterRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 15000,
      required: true,
    },
    token: {
      type: String,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      required: [true, "Verify token is required"],
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Date,
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleSaveError);

userSchema.pre("findOneAndUpdate", runValidators);

userSchema.post("findOneAndUpdate", handleSaveError);

export const userSignupSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(8).max(64).required(),
});

export const userSigninSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(8).max(64).required(),
});

export const userEmailSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
});

export const userResetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(8).max(64).required(),
});

export const updateUserInfoSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().pattern(emailRegexp),
  outdatedPassword: Joi.string().min(8).max(64),
  newPassword: Joi.string().min(8).max(64),
  gender: Joi.string().valid(...genderList),
});

export const userWaterRateSchema = Joi.object({
  waterRate: Joi.integer().min(0).max(15000).required(),
});

const User = model("user", userSchema);

export default User;
