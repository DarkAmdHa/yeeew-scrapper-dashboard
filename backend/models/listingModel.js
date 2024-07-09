import mongoose from "mongoose";

const roomSchema = mongoose.Schema({
  roomName: {
    type: String,
  },
  maxOccupancy: {
    type: String,
  },
  priceWhenScrapped: {
    type: String,
  },
  roomFacilities: [
    {
      type: String,
    },
  ],
});
const amenitiesSchema = mongoose.Schema({
  amenities: [
    {
      type: String,
    },
  ],
  type: {
    type: String,
  },
});

const surroundingSchema = new mongoose.Schema({
  type: {
    type: String,
  },
  name: {
    type: String,
  },
  distance: {
    type: String,
  },
});

const propertySurroundingsSchema = mongoose.Schema({
  surroundingType: {
    type: String,
    required: true,
  },
  surroundings: [surroundingSchema],
});

const ListingSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    businessName: {
      type: String,
      required: true,
    },
    businessURL: {
      type: String,
    },
    tripType: [
      {
        type: String,
      },
    ],

    highlightsAndTopAmenities: [
      {
        type: String,
      },
    ],
    accommodationType: [
      {
        type: String,
      },
    ],
    roomsFromBooking: [roomSchema],
    propertyAmenitiesFromBooking: [amenitiesSchema],
    propertySurroundingsFromBooking: [propertySurroundingsSchema],
    location: {
      type: String,
    },
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    },
    region: {
      type: String,
    },
    address: {
      type: String,
    },
    contactName: {
      type: String,
    },
    email: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    whatsappNumber: {
      type: String,
    },
    customSlug: {
      type: String,
    },
    summary: {
      type: String,
    },
    perfectWave: {
      highlights: {
        type: String,
      },
      summary: {
        type: String,
      },
      link: {
        type: String,
      },
    },
    luex: {
      highlights: {
        type: String,
      },
      summary: {
        type: String,
      },
      link: {
        type: String,
      },
    },
    waterways: {
      highlights: {
        type: String,
      },
      summary: {
        type: String,
      },
      link: {
        type: String,
      },
    },
    worldSurfaris: {
      highlights: {
        type: String,
      },
      summary: {
        type: String,
      },
      link: {
        type: String,
      },
    },
    awave: {
      highlights: {
        type: String,
      },
      summary: {
        type: String,
      },
      link: {
        type: String,
      },
    },
    atollTravel: {
      highlights: {
        type: String,
      },
      summary: {
        type: String,
      },
      link: {
        type: String,
      },
    },
    surfHolidays: {
      highlights: {
        type: String,
      },
      summary: {
        type: String,
      },
      link: {
        type: String,
      },
    },
    surfline: {
      highlights: {
        type: String,
      },
      summary: {
        type: String,
      },
      link: {
        type: String,
      },
    },
    lushPalm: {
      highlights: {
        type: String,
      },
      summary: {
        type: String,
      },
      link: {
        type: String,
      },
    },
    thermal: {
      highlights: {
        type: String,
      },
      summary: {
        type: String,
      },
      link: {
        type: String,
      },
    },
    bookSurfCamps: {
      highlights: {
        type: String,
      },
      summary: {
        type: String,
      },
      link: {
        type: String,
      },
    },
    nomadSurfers: {
      highlights: {
        type: String,
      },
      summary: {
        type: String,
      },
      link: {
        type: String,
      },
    },
    stokedSurfAdventures: {
      highlights: {
        type: String,
      },
      summary: {
        type: String,
      },
      link: {
        type: String,
      },
    },
    soulSurfTravel: {
      highlights: {
        type: String,
      },
      summary: {
        type: String,
      },
      link: {
        type: String,
      },
    },
    surfersHype: {
      highlights: {
        type: String,
      },
      summary: {
        type: String,
      },
      link: {
        type: String,
      },
    },
    expedia: {
      highlights: {
        type: String,
      },
      summary: {
        type: String,
      },
      link: {
        type: String,
      },
    },
    booking: {
      highlights: {
        type: String,
      },
      summary: {
        type: String,
      },
      link: {
        type: String,
      },
    },
    agoda: {
      highlights: {
        type: String,
      },
      summary: {
        type: String,
      },
      link: {
        type: String,
      },
    },
    trip: {
      highlights: {
        type: String,
      },
      summary: {
        type: String,
      },
      link: {
        type: String,
      },
    },
    trivago: {
      highlights: {
        type: String,
      },
      summary: {
        type: String,
      },
      link: {
        type: String,
      },
    },
    scrapedImages: [
      {
        type: String,
      },
    ],
    overview: {
      type: String,
    },
    aboutAccomodation: {
      type: String,
    },
    foodInclusions: {
      type: String,
    },
    specificSurfSpots: {
      type: String,
    },
    gettingThere: {
      type: String,
    },
    faq: [
      {
        faq_question: {
          type: String,
        },
        faq_answer: {
          type: String,
        },
      },
    ],
    scraped: {
      type: Boolean,
      required: true,
      default: false,
    },
    scrapedAt: {
      type: Date,
    },
    timeToScrape: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Listing = mongoose.model("Listing", ListingSchema);

export default Listing;
