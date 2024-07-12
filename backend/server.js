import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import connectDB from "./config/db.js";
import cron from "node-cron";

import listingRoutes from "./routes/listingRoutes.js";
import promptRoutes from "./routes/promptRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import operationRoutes from "./routes/operationRoutes.js";
import {
  checkAndInitiateScrappingOperation,
  checkAndInitiateExportOperation,
} from "./scrapper/ScrapperCRON.js";

import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import Scrapper from "./scrapper/Scrapper.js";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ success: true });
});

app.use("/api/listing", listingRoutes);
app.use("/api/prompts", promptRoutes);
app.use("/api/operations", operationRoutes);
app.use("/api/auth", authRoutes);
// app.use("/api/scrapper", scrapperRoutes);

cron.schedule("*/5 * * * *", () => {
  //Every 5 minutes
  console.log("Running CRON job to check for operations");
  checkAndInitiateScrappingOperation();
  checkAndInitiateExportOperation();
});

//  Catch-all middleware defined after all other route handlers
//  Will only be executed if no other route matches the incoming request:
app.use(notFound);

//Custom Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`.yellow.bold
  );
});
