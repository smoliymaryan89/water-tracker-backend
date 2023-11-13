import express from "express";

import authController from "../../controllers/auth-controller.js";
import * as userSchemas from "../../models/Users.js";

import {
  authenticate,
  isEmptyBody,
  isValidId,
  upload,
} from "../../middlewares/index.js";
import { validateBody } from "../../decorators/index.js";

const authRouter = express.Router();

const userSignupValidate = validateBody(userSchemas.userSignupSchema);
const userSigninValidate = validateBody(userSchemas.userSigninSchema);
const userWaterRateValidate = validateBody(userSchemas.userWaterRateSchema);
const userInfoValidate = validateBody(userSchemas.updateUserInfoSchema);
const userEmailValidate = validateBody(userSchemas.userEmailSchema);
const userResetPasswordValidate = validateBody(
  userSchemas.userResetPasswordSchema
);

authRouter.post(
  "/signup",
  isEmptyBody,
  userSignupValidate,
  authController.signup
);

authRouter.get("/verify/:verificationCode", authController.verify);

authRouter.post(
  "/verify",
  isEmptyBody,
  userEmailValidate,
  authController.resendVerifyEmail
);

authRouter.post(
  "/signin",
  isEmptyBody,
  userSigninValidate,
  authController.singin
);

authRouter.post("/signout", authenticate, authController.signout);

authRouter.post(
  "/forgotPassword",
  userEmailValidate,
  authController.forgotPassword
);

authRouter.post(
  "/resetPassword/:resetToken",
  userResetPasswordValidate,
  authController.resetPassword
);

authRouter.get("/current", authenticate, authController.getCurrent);

authRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatarURL"),
  authController.updateUserAvatar
);

authRouter.patch(
  "/waterRate/:userId",
  authenticate,
  isValidId,
  userWaterRateValidate,
  authController.updateWaterRate
);

authRouter.patch(
  "/:userId",
  authenticate,
  isValidId,
  isEmptyBody,
  userInfoValidate,
  authController.updateUserInfo
);

export default authRouter;
