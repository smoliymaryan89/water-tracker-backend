import { Schema, model } from "mongoose";
import Joi from "joi";

import { handleSaveError, runValidators } from "./hooks.js";

const waterSchema = new Schema(
  {
    count: {
      type: String,
      required: [true, "Set count"],
    },
    date: {
      type: Date,
    },
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
  date: Joi.string(),
});

const Water = model("water", waterSchema);
export default Water;
