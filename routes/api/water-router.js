import express from "express";
import {
  isEmptyBody,
  isValidId,
  authenticate,
} from "../../middlewares/index.js";
import { validateBody } from "../../decorators/index.js";

import { waterAddSchema } from "../../models/Water.js";

import waterController from "../../controllers/water-controller.js";

const waterAddValidate = validateBody(waterAddSchema);

const waterRouter = express.Router();

waterRouter.use(authenticate);

waterRouter.post(
  "/",
  isEmptyBody,
  waterAddValidate,
  waterController.addConsumedWater
);

waterRouter.patch(
  "/:waterId",
  isValidId,
  isEmptyBody,
  waterAddValidate,
  waterController.updateWater
);

waterRouter.delete("/:waterId", isValidId, waterController.deleteById);

waterRouter.get("/today", waterController.getTodayWater);

waterRouter.get("/month", waterController.getMonthlyWater);
waterRouter.post("/paginationMonth", waterController.paginationGetMonthlyWater);


export default waterRouter;
