// const axios = require("axios");
import axios from "axios";
import { logToConsole } from "../utils/functions.js";

class PricelineAPIFetcher {
  constructor(businessName, entityId) {
    this.businessName = businessName;
    this.entityId = entityId ?? "";
    this.foundEntities = [];
    this.coordinates = {
      lat: "",
      long: "",
    };
    this.description = null;
  }

  async init() {
    if (!this.entityId) await this.getBusinessId(this.businessName);
    else {
      await this.fetchResortDetails();
    }
    if (this.entityId)
      return {
        id: this.entityId,
        data: {
          ...this.description,
          coordinates: this.coordinates,
        },
      };
  }

  async getBusinessId(businessName) {
    const options = {
      method: "GET",
      url: "https://priceline-com-provider.p.rapidapi.com/v1/hotels/locations",
      params: {
        name: businessName,
        search_type: "ALL",
      },
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "priceline-com-provider.p.rapidapi.com",
      },
    };

    try {
      const { data } = await axios.request(options);
      if (data.length) {
        const relevantHotel = data.find((item) => item.id);
        //In case this one does not yield data:
        this.foundEntities = data;
        if (relevantHotel) {
          this.entityId = relevantHotel.id;
          if (relevantHotel.lat && relevantHotel.lon) {
            this.coordinates.lat = relevantHotel.lat;
            this.coordinates.long = relevantHotel.lon;
          }
          await this.fetchResortDetails();
        }
      }
    } catch (error) {
      logToConsole(error);
    }
  }

  async fetchResortDescription() {
    const options = {
      method: "GET",
      url: "https://priceline-com-provider.p.rapidapi.com/v1/hotels/details",
      params: {
        offset_of_reviews: "0",
        hotel_id: this.entityId,
      },
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "priceline-com-provider.p.rapidapi.com",
      },
    };
    try {
      const { data } = await axios.request(options);

      const newData = {
        description: data.description,
        policies: data.policies && {
          childrenDescription: data.policies.childrenDescription,
          petDescription: data.policies.petDescription,
          importantInfo: data.policies.importantInfo,
        },
        highlights: {
          features: data.hotelFeatures && data.hotelFeatures.features,
          hotelAmenities:
            data.hotelFeatures &&
            data.hotelFeatures.hotelAmenities.map((item) => item.name),
        },

        propertyGallery:
          data.images &&
          data.images.map((image) => ({
            imageUrl: image.imageHDUrl,
          })),
      };
      this.description = newData;
    } catch (error) {
      if (error.response.data.detail == "404") {
        //The item was not found from the api:
        const anotherItem = this.foundEntities.find(
          (item) => item.id && item.id != this.entityId
        );
        if (anotherItem) {
          this.entityId = anotherItem.id;
          await this.fetchResortDescription();
        }
      }
      logToConsole(error);
    }
  }

  async fetchResortDetails() {
    await this.fetchResortDescription();
  }
}
export default PricelineAPIFetcher;
