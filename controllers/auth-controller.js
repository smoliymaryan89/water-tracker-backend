import fs from "fs/promises";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/Users.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import { HttpError, cloudinary } from "../helpers/index.js";

const { JWT_SECRET } = process.env;

const signup = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError("409", "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({ ...req.body, password: hashPassword });

  res.status(201).json({
    email: newUser.email,
  });
};

const singin = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const passwordCompare = bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

  await User.findByIdAndUpdate(user._id, { token, refreshToken });

  res.json({
    token,
    refreshToken,
    user: {
      email: user.email,
    },
  });
};

const signout = async (req, res) => {
  const { _id } = req.user;

  await User.findByIdAndUpdate(_id, { token: "", refreshToken: "" });

  res.json({
    message: "Signout success",
  });
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  const { id } = jwt.verify(refreshToken, JWT_SECRET);
  const user = await User.findOne({ refreshToken });

  if (!user) {
    throw HttpError(403);
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  const newRefreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  await User.findByIdAndUpdate(id, { token, refreshToken: newRefreshToken });

  res.json({
    token,
    refreshToken: newRefreshToken,
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

  res.json({
    user,
  });
};

const updateWaterRate = async (req, res) => {
  const { userId } = req.params;

  const result = await User.findOneAndUpdate({ _id: userId }, req.body);

  if (!result) {
    throw HttpError(404);
  }

  res.json(result);
};

export default {
  signup: ctrlWrapper(signup),
  singin: ctrlWrapper(singin),
  signout: ctrlWrapper(signout),
  refresh: ctrlWrapper(refresh),
  getCurrent: ctrlWrapper(getCurrent),
  updateUserAvatar: ctrlWrapper(updateUserAvatar),
  updateUserInfo: ctrlWrapper(updateUserInfo),
  updateWaterRate: ctrlWrapper(updateWaterRate),
};
