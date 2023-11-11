import express from "express";
import { isEmptyBody, isValidId } from "../../middlewares/index.js";
import { validateBody } from "../../decorators/index.js";

import { waterAddSchema } from "../../models/Water.js";

import waterController from "../../controllers/water-controller.js";

const waterAddValidate = validateBody(waterAddSchema);

const waterRouter = express.Router();

waterRouter.post(
  "/",
  isEmptyBody,
  waterAddValidate,
  waterController.addConsumedWater
);

waterRouter.patch(
  "/:waterId",
  isEmptyBody,
  waterAddValidate,
  waterController.updateWater
);

waterRouter.delete("/:waterId", isValidId, waterController.deleteById);


export default waterRouter;
