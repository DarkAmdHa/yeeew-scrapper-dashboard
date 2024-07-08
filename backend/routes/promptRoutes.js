import express from "express";
import PromptController from "../contollers/PromptController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @desc    Fetch All Prompts
// @route   GET /api/prompts/:id
// @access  Private Route

// @desc    Update prompts
// @route   PUT /api/prompts/:id
// @access  Private Route
router.get("/", protect, PromptController.getAllPrompts);
router.put("/:id", protect, PromptController.updatePrompt);

export default router;
