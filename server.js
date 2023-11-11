import mongoose from "mongoose";
import app from "./app.js";

const { PORT = 5555, DB_HOST } = process.env;

// 7x3kPTK3WgBRCH3O

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(PORT, () => {
      console.log("Database connection successful");
    });
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
