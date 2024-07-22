import mongoose from "mongoose";

const bookingAPIDataSchema = new mongoose.Schema(
  {
    id: String,
    data: {
      description: [String],
      policies: [String],
      landmarks: {
        closestLandmarks: [
          {
            lat: Number,
            long: Number,
            name: String,
            distance: String,
            votes: Number,
            review: Number,
          },
        ],
        popularLandmarks: [
          {
            lat: Number,
            long: Number,
            name: String,
            distance: String,
            votes: Number,
            review: Number,
          },
        ],
      },
      coordinates: {
        lat: String,
        long: String,
      },
    },
  },
  { _id: false }
);

export default bookingAPIDataSchema;
