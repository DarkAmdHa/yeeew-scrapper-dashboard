import mongoose from "mongoose";

const promptSchema = mongoose.Schema(
  {
    adminPrompt: {
      type: String,
      required: true,
    },
    contentGenerationPromptWithJson: {
      type: String,
      required: true,
    },
    slugBuilderPrompt: {
      type: String,
      required: true,
    },
    contentGenerationPrompt: {
      type: String,
      required: true,
    },
    platformDataRetreivalPrompt: {
      type: String,
      required: true,
    },
    fullScrapperPrompt: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Prompt = mongoose.model("Prompt", promptSchema);

export default Prompt;
