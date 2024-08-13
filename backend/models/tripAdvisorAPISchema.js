import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  reviewRating: { type: Number },
  disclaimer: { type: String, default: "" },
  reviewText: { type: String, default: "" },
  reviewTitle: { type: String, default: "" },
  publishedDate: { type: String, default: "" },
  userProfile: {
    displayName: { type: String, default: "" },
    contributionCount: { type: String, default: "" },
    avatar: { type: String, default: "" },
    profileLink: { type: String, default: "" },
    photos: [
      {
        link: {
          type: String,
          default: "",
        },
        photo: {
          type: String,
          default: "",
        },
      },
    ],
  },
});

const tripAdvisorAPIDataSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    data: {
      reviews: [reviewSchema],
    },
  },
  { _id: false }
);

export default tripAdvisorAPIDataSchema;
