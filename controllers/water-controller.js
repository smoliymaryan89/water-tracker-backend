import Water from "../models/Water.js";
import HttpError from "../helpers/HttpError.js";
import { ctrlWrapper } from "../decorators/index.js";

import User from "../models/Users.js";

function getTime() {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentMonth = monthNames[currentDate.getMonth()];
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();

  return { day, currentMonth, hours, minutes };
}

const addConsumedWater = async (req, res) => {
  const { id: owner } = req.user;
  const { day, currentMonth, hours, minutes } = getTime();

  const result = await Water.create({
    ...req.body,
    owner,
    day,
    currentMonth,
    hours,
    minutes,
  });
  res.status(201).json(result);
};

const updateWater = async (req, res) => {
  const { id: owner } = req.user;
  const { waterId } = req.params;

  const { day, currentMonth, hours, minutes } = getTime();

  const result = await Water.findOneAndUpdate(
    { _id: waterId, owner },
    {
      ...req.body,
      day,
      currentMonth,
      hours,
      minutes,
    }
  );

  if (!result) {
    throw HttpError(404);
  }

  res.json(result);
};

const deleteById = async (req, res) => {
  const { id: owner } = req.user;
  const { waterId } = req.params;
  const result = await Water.findOneAndDelete({
    _id: waterId,
    owner,
  });

  if (!result) {
    throw HttpError(404);
  }

  res.json({ message: "water deleted" });
};

const getTodayWater = async (req, res) => {
  const { id: owner } = req.user;

  // Отримати поточну дату та час
  const { day, currentMonth, hours, minutes } = getTime();

  // Отримати всі записи споживання води користувачем за поточний день
  const waterRecords = await Water.find({
    owner,
    day,
    currentMonth,
  });
  ``;
  // Розрахунок відсотка використання води від денної норми користувача
  const user = await User.findById(owner);
  const { waterRate } = user;
  // const waterRate = 5000;
  const totalWaterConsumed = waterRecords.reduce(
    (total, record) => total + record.count,
    0
  );
  const percentageUsed = Math.min((totalWaterConsumed / waterRate) * 100, 100);

  const percentageUsedRounded = parseFloat(percentageUsed.toFixed(2));

  res.json({
    percentageUsedRounded,
    waterRecords,
  });
};

export default {
  addConsumedWater: ctrlWrapper(addConsumedWater),
  updateWater: ctrlWrapper(updateWater),
  deleteById: ctrlWrapper(deleteById),
  getTodayWater: ctrlWrapper(getTodayWater),
};
