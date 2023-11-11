import Water from "../models/Water.js";
import HttpError from "../helpers/HttpError.js";
import { ctrlWrapper } from "../decorators/index.js";

const addConsumedWater = async (req, res) => {
  //   const { id: owner } = req.user;
  const { id: owner } = 123;
  const date = new Date();

  const result = await Water.create({ ...req.body, owner, date });
  res.status(201).json(result);
};

const updateWater = async (req, res) => {
  //   const { id: owner } = req.user;
  const { id: owner } = 123;

  const { waterId } = req.params;

  const result = await Water.findOneAndUpdate(
    { _id: waterId, owner },
    req.body
  );

  if (!result) {
    throw HttpError(404);
  }

  res.json(result);
};

const deleteById = async (req, res) => {
  //   const { id: owner } = req.user;
  //   const { id: owner } = 123;
  const { waterId } = req.params;
  const result = await Water.findOneAndDelete({ _id: waterId });

  if (!result) {
    throw HttpError(404);
  }

  res.json({ message: "water deleted" });
};

export default {
  addConsumedWater: ctrlWrapper(addConsumedWater),
  updateWater: ctrlWrapper(updateWater),
  deleteById: ctrlWrapper(deleteById),
};
