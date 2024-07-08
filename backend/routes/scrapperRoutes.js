import express from "express";
import ScraperController from "../contollers/ScrapperController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

export default router;
