import fs from "fs/promises";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { nanoid } from "nanoid";

import User from "../models/Users.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import { HttpError, cloudinary, sendEmail } from "../helpers/index.js";

const { JWT_SECRET, BASE_URL } = process.env;

const signup = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError("409", "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const verificationCode = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    verificationCode,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationCode}">Click to verify</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    email: newUser.email,
  });
};

const verify = async (req, res) => {
  const { verificationCode } = req.params;
  const user = await User.findOne({ verificationCode });

  if (!user) {
    throw HttpError(404, "User not found");
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationCode: "null",
  });

  res.json({ message: "Verification successful" });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(404, "Email not found");
  }

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${user.verificationCode}">Click to verify</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({ message: "Verification email sent" });
};

const singin = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  if (!user.verify) {
    throw HttpError(401, "Email not verify");
  }

  const passwordCompare = bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });

  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
    user: {
      email: user.email,
    },
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = User.findOne({ email });
  if (!user) {
    throw HttpError(404);
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = Date.now() + 3600000;

  await User.findByIdAndUpdate(user._id, {
    resetToken,
    resetTokenExpiry,
  });

  // TODO Замінити link
  const resetPasswordLink = `${BASE_URL}/api/auth/reset-password/${resetToken}`;

  const resetPasswordEmail = {
    to: email,
    subject: "Reset Password",
    html: `<p>You are receiving this email because you (or someone else) has requested the reset of the password for your account.</p>
            <p>Please click on the following link to reset your password:</p>
            <a href="${resetPasswordLink}" target="_blank">${resetPasswordLink}</a>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
  };

  await sendEmail(resetPasswordEmail);

  res.json({ message: "Reset password email sent" });
};

const signout = async (req, res) => {
  const { _id } = req.user;

  await User.findByIdAndUpdate(_id, { token: "" });

  res.json({
    message: "Signout success",
  });
};

const getCurrent = async (req, res) => {
  const { email } = req.user;

  const currentUser = await User.findOne({ email }).select("-password");

  res.json(currentUser);
};

const updateUserAvatar = async (req, res) => {
  const { _id: owner } = req.user;
  const { url: avatar } = await cloudinary.uploader.upload(req.file.path, {
    folder: "avatars",
  });

  await fs.unlink(req.file.path);

  await User.findByIdAndUpdate(owner, { avatarURL: avatar });

  res.json({
    avatar,
  });
};

const updateUserInfo = async (req, res) => {
  const { name, email, gender } = req.body;
  const { userId } = req.params;

  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw HttpError(404);
  }
  if (name) user.name = name;
  if (email) user.email = email;
  if (gender) user.gender = gender;

  await user.save();

  res.json({
    user,
  });
};

const updateWaterRate = async (req, res) => {
  const { userId } = req.params;
  const { waterRate } = req.body;

  const waterInMilliliters = waterRate * 1000;

  const result = await User.findOneAndUpdate(
    { _id: userId },
    { waterRate: waterInMilliliters }
  );

  if (!result) {
    throw HttpError(404);
  }

  res.json(result);
};

export default {
  signup: ctrlWrapper(signup),
  verify: ctrlWrapper(verify),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  singin: ctrlWrapper(singin),
  forgotPassword: ctrlWrapper(forgotPassword),
  signout: ctrlWrapper(signout),
  getCurrent: ctrlWrapper(getCurrent),
  updateUserAvatar: ctrlWrapper(updateUserAvatar),
  updateUserInfo: ctrlWrapper(updateUserInfo),
  updateWaterRate: ctrlWrapper(updateWaterRate),
};
