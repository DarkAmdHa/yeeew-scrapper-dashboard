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

const offerSchema = new mongoose.Schema({
  providerName: { type: String, default: "N/A" },
  displayPrice: { type: String, default: "N/A" },
  details: [{ type: String, default: "" }],
  status: { type: String, default: "" },
  commerceLink: { type: String, default: "N/A" },
});

const tripAdvisorAPIDataSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    data: {
      reviews: [reviewSchema],
      rating: Number,
      totalReviews: Number,
      offers: [offerSchema],
      webUrl: { type: String, default: "N/A" },
    },
  },
  { _id: false }
);

export default tripAdvisorAPIDataSchema;
