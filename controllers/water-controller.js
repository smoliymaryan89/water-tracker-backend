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

  return { day, currentMonth };
}

const addConsumedWater = async (req, res) => {
  const { id: owner } = req.user;
  const { time,count } = req.body;
  const { day, currentMonth } = getTime();

  const result = await Water.create({
    ...req.body,
    owner,
    day,
    currentMonth,
    time,
    count,
  });
  res.status(201).json(result);
};

const updateWater = async (req, res) => {
  const { id: owner } = req.user;
  const { waterId } = req.params;
  const { time,count } = req.body;

  const { day, currentMonth } = getTime();

  const result = await Water.findOneAndUpdate(
    { _id: waterId, owner },
    {
      ...req.body,
      day,
      currentMonth,
      time,
      count
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
  const { day, currentMonth } = getTime();

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

const getMonthlyWater = async (req, res) => {
  const { id: owner } = req.user;
  const { month } = req.body; // Отримати обраний місяць
  // Знайти всі записи споживання води користувачем за обраний місяць
  const waterRecords = await Water.find({
    owner,
    currentMonth: month,
  });
  const currentMonth = new Date().getMonth();

  // Отримати кількість днів у вибраному місяці
  const daysInMonth = new Date(
    new Date().getFullYear(),
    currentMonth,
    0
  ).getDate();

  // Розрахувати денну норму води для користувача
  const user = await User.findById(owner);
  const { waterRate } = user;
  // Об'єкт для зберігання інформації за кожен день місяця
  const monthlyInfo = [];

  // Пройтися по кожному дню у місяці
  for (let day = 1; day <= daysInMonth; day++) {
    // Знайти всі записи споживання води для обраного дня
    const dailyWaterRecords = waterRecords.filter(
      (record) => record.day === day.toString()
    );

    // Розрахувати загальну кількість спожитої води для обраного дня
    const totalWaterConsumed = dailyWaterRecords.reduce(
      (total, record) => total + record.count,
      0
    );

    // Розрахувати відсоток використання води від денної норми
    const percentageUsed = Math.min(
      (totalWaterConsumed / waterRate) * 100,
      100
    );
    const percentageUsedRounded = parseFloat(percentageUsed.toFixed(2));
    const percent = percentageUsedRounded || 0;
    // Додати інформацію за день до масиву
    monthlyInfo.push({
      date: `${day}, ${month}`,
      dailyWaterRate: waterRate,
      percent,
      consumptionCount: dailyWaterRecords.length,
    });
  }

  res.json(monthlyInfo);
};

export default {
  addConsumedWater: ctrlWrapper(addConsumedWater),
  updateWater: ctrlWrapper(updateWater),
  deleteById: ctrlWrapper(deleteById),
  getTodayWater: ctrlWrapper(getTodayWater),
  getMonthlyWater: ctrlWrapper(getMonthlyWater),
};
