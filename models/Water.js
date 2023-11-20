import { Schema, model } from "mongoose";
import Joi from "joi";

import { handleSaveError, runValidators } from "./hooks.js";

const waterSchema = new Schema(
  {
    count: {
      type: Number,
      required: [true, "Set count"],
      max: [1500, "Count cannot exceed 1500"],
    },
    time: { type: String },
    day: { type: String },
    currentMonth: { type: String },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { versionKey: false, timeseries: true }
);


waterSchema.post("save", handleSaveError);

waterSchema.pre("findOneAndUpdate", runValidators);
waterSchema.post("findOneAndUpdate", handleSaveError);

export const waterAddSchema = Joi.object({
  count: Joi.string().required().messages({
    "any.required": `missing required "count" field`,
  }),
  time: Joi.string(),
  day: Joi.string(),
  month: Joi.string(),
});

const Water = model("water", waterSchema);
export default Water;
