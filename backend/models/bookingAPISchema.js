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
      details: {
        price: {
          productPrice: Number,
          grossAmountPerNight: Number,
          allInclusiveAmount: Number,
          excludedAmount: Number,
          grossAmountHotelCurrency: Number,
          compositeGrossAmountPerNight: Number,
          compositeAllInclusiveAmount: Number,
          compositeExcludedAmount: Number,
          taxesAndCharges: String,
        },
        url: String,
        businessInformation: {
          hotelName: String,
          address: String,
          city: String,
          country: String,
          rating: Number,
          reviewNumber: Number,
          facilities: [String],
          sustainability: String,
        },
      },
    },
  },
  { _id: false }
);

export default bookingAPIDataSchema;
