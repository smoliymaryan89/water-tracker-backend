import { isValidObjectId } from "mongoose";
import { HttpError } from "../helpers/index.js";

const isValidId = (req, res, next) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return next(HttpError(404, `${userId} is not valid id`));
  }

  next();
};

export default isValidId;
