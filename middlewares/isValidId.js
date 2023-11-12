import { isValidObjectId } from "mongoose";
import { HttpError } from "../helpers/index.js";

const isValidId = (req, res, next) => {
  const idParams = Object.keys(req.params);

  for (const param of idParams) {
    const id = req.params[param];

    if (!isValidObjectId(id)) {
      return next(HttpError(404, `${id} is not a valid id`));
    }
  }

  next();
};

export default isValidId;
