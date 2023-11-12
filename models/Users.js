import Joi from "joi";
import { Schema, model } from "mongoose";
import { handleSaveError, runValidators } from "./hooks.js";
import { json } from "express";

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
    oldPassword: {
      type: String,
      minlength: 8,
      maxlength: 64,
    },
    gender: {
      type: String,
      enum: genderList,
      default: genderList[0],
    },
    avatarURL: {
      type: String,
    },
    token: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleSaveError);

userSchema.pre("findOneAndUpdate", runValidators);

userSchema.post("findOneAndUpdate", handleSaveError);

export const userSignupSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).max(64).required(),
});

export const userSigninSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).max(64).required(),
});

export const updateUserInfo = Joi.object({
  name: Joi.string(),
  email: Joi.string().pattern(emailRegexp),
  gender: Joi.string().valid(...genderList),
});

export const userRefreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const User = model("user", userSchema);

export default User;
