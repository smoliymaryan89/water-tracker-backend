import { isValidObjectId } from "mongoose";
import { HttpError } from "../helpers/index.js";

const isValidId = (req, res, next) => {
  const { waterId } = req.params;

  if (!isValidObjectId(waterId)) {
    return next(HttpError(404, `${waterId} is not valid id`));
  }

  next();
};

export default isValidId;
