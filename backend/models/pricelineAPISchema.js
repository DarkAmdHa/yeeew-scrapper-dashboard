import mongoose from "mongoose";

const policySchema = new mongoose.Schema(
  {
    childrenDescription: String,
    petDescription: String,
    importantInfo: [String],
  },
  { _id: false }
);

const highlightsSchema = new mongoose.Schema(
  {
    features: [String],
    hotelAmenities: [String],
  },
  { _id: false }
);

const propertyGallerySchema = new mongoose.Schema(
  {
    imageUrl: String,
  },
  { _id: false }
);

const pricelineSchema = new mongoose.Schema({
  id: { type: String },
  data: {
    type: new mongoose.Schema(
      {
        description: String,
        policies: policySchema,
        highlights: highlightsSchema,
        propertyGallery: [propertyGallerySchema],
        coordinates: {
          lat: String,
          long: String,
        },
      },
      { _id: false }
    ),
  },
});

export default pricelineSchema;
