import Prompt from "../models/promptModel.js";

import asyncHandler from "express-async-handler";

class PromptController {
  constructor() {
    this.model = Prompt;
  }

  getAllPrompts = asyncHandler(async (req, res) => {
    const prompts = await this.model.find({});
    res.json(prompts[0]);
  });
  updatePrompt = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
      const updatedPrompt = await this.model.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updatedPrompt) {
        res.status(404);
        throw new Error("Prompt not found");
      }

      res.json(updatedPrompt);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  });
}

export default new PromptController();
