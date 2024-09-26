import mongoose from "mongoose";

const agodaAPIDataSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    data: {
      zipCode: String,
      address: String,
      city: String,
      state: String,
      country: String,
      longitude: String,
      latitude: String,
      url: String,
      numberOfRooms: String,
      overview: String,
      numberOfReviews: String,
      accommodationType: String,
      hotelName: String,
    },
  },
  { _id: false }
);

export default agodaAPIDataSchema;
