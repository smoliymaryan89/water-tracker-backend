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
const userRefreshValidate = validateBody(userSchemas.userRefreshTokenSchema);

authRouter.post(
  "/signup",
  isEmptyBody,
  userSignupValidate,
  authController.signup
);

authRouter.post(
  "/signin",
  isEmptyBody,
  userSigninValidate,
  authController.singin
);

authRouter.post("/signout", authenticate, authController.signout);

authRouter.post("/refresh", userRefreshValidate, authController.refresh);

authRouter.get("/current", authenticate, authController.getCurrent);

authRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatarURL"),
  authController.updateUserAvatar
);

authRouter.patch("/:userId", isValidId, authController.updateUserInfo);

export default authRouter;