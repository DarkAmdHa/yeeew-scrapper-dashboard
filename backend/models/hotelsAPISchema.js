import mongoose from "mongoose";

const coordinatesSchema = new mongoose.Schema(
  {
    lat: { type: String },
    long: { type: String },
  },
  { _id: false }
);

const policiesSchema = new mongoose.Schema(
  {
    checkinInstructions: [{ type: String }],
    needToKnow: [{ type: String }],
    childAndBed: [{ type: String }],
    paymentOptions: [{ type: String }],
    pets: [{ type: String }],
    shouldMention: [{ type: String }],
  },
  { _id: false }
);

const amenitiesSchema = new mongoose.Schema(
  {
    amenities: [{ type: String }],
    topAmenities: [{ type: String }],
    highlight: [{ type: String }],
    property: [{ type: String }],
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    whatsAround: [{ type: String }],
    mapImage: { type: String },
  },
  { _id: false }
);

const nearbyPOISchema = new mongoose.Schema(
  {
    text: { type: String },
    moreInfo: { type: String },
  },
  { _id: false }
);

const summarySchema = new mongoose.Schema(
  {
    tagLine: { type: String },
    policies: policiesSchema,
    highlights: amenitiesSchema,
    location: locationSchema,
    nearbyPOIs: [nearbyPOISchema],
  },
  { _id: false }
);

const propertyGallerySchema = new mongoose.Schema(
  {
    imageDescription: { type: String },
    url: { type: String },
  },
  { _id: false }
);

const propertyContentSectionSchema = new mongoose.Schema(
  {
    aboutThisProperty: [{ type: String }],
    policies: [{ type: String }],
  },
  { _id: false }
);

const hotelSchema = new mongoose.Schema(
  {
    id: { type: String },
    data: {
      summary: summarySchema,
      reviewInfo: { type: String },
      propertyGallery: [propertyGallerySchema],
      propertyContentSectionGroups: propertyContentSectionSchema,
      coordinates: coordinatesSchema,
    },
  },
  { _id: false }
);

export default hotelSchema;
