import mongoose from "mongoose";

const OperationSchema = new mongoose.Schema(
  {
    listings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
      },
    ],
    processedListingsId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
      },
    ],
    totalListings: {
      type: Number,
      required: true,
      default: 0,
    },
    processedListings: {
      type: Number,
      required: true,
      default: 0,
    },
    errorListings: [
      {
        listingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Listing",
        },
        errors: [
          {
            type: String,
          },
        ],
      },
    ],
    status: {
      type: String,
      required: true,
      enum: ["queued", "running", "finished", "cancelled", "timed-out"],
      default: "queued",
    },
    type: {
      type: String,
      required: true,
      enum: ["Export", "Scrape"],
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    startedAt: {
      type: Date,
    },
    finishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Operation = mongoose.model("Operation", OperationSchema);

export default Operation;
