import axios from "axios";
import { logToConsole } from "../utils/functions.js";
class BookingAPIFetcher {
  constructor(businessName) {
    this.businessName = businessName;
    this.entityId = "";
    this.coordinates = {
      lat: "",
      long: "",
    };

    this.description = null;
    this.policies = null;
    this.landmarks = null;
  }

  async init() {
    await this.getBusinessId(this.businessName);
    if (this.entityId)
      return {
        id: this.entityId,
        data: {
          description: this.description,
          policies: this.policies,
          landmarks: this.landmarks,
          coordinates: this.coordinates,
        },
      };
  }

  async getBusinessId(businessName) {
    const options = {
      method: "GET",
      url: "https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination",
      params: { query: businessName },
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "booking-com15.p.rapidapi.com",
      },
    };

    try {
      const { data } = await axios.request(options);
      if (data.data.length) {
        this.coordinates = {
          lat: `${data.data[0].latitude}`,
          long: `${data.data[0].longitude}`,
        };
        this.entityId = data.data[0].dest_id;
        if (this.entityId) await this.fetchResortDetails();
      }
    } catch (error) {
      logToConsole(error);
    }
  }

  async fetchResortDescription() {
    const options = {
      method: "GET",
      url: "https://booking-com15.p.rapidapi.com/api/v1/hotels/getDescriptionAndInfo",
      params: { hotel_id: this.entityId, languagecode: "en-us" },
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "booking-com15.p.rapidapi.com",
      },
    };
    try {
      const { data } = await axios.request(options);

      if (data.data.length) {
        this.description = data.data.map((item) => item.description);
      }
    } catch (error) {
      logToConsole(error);
    }
  }

  async fetchResortPolicies() {
    const options = {
      method: "GET",
      url: "https://booking-com15.p.rapidapi.com/api/v1/hotels/getHotelPolicies",
      params: { hotel_id: this.entityId, languagecode: "en-us" },
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "booking-com15.p.rapidapi.com",
      },
    };
    try {
      const { data } = await axios.request(options);

      if (data.data.policy && data.data.policy.length) {
        this.policies = data.data.policy
          .flatMap((pol) => pol.content && pol.content.map((item) => item.text))
          .filter(Boolean);
      }
    } catch (error) {
      logToConsole(error);
    }
  }

  async fetchResortPopularLandmarks() {
    const options = {
      method: "GET",
      url: "https://booking-com15.p.rapidapi.com/api/v1/hotels/getPopularAttractionNearBy",
      params: { hotel_id: this.entityId, languagecode: "en-us" },
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "booking-com15.p.rapidapi.com",
      },
    };
    try {
      const { data } = await axios.request(options);
      this.landmarks = data.data && {
        closestLandmarks: data.data.closest_landmarks.map((landmark) => ({
          lat: landmark.latitude,
          long: landmark.longitude,
          name: landmark.tag,
          distance: landmark.distance,
          votes: landmark.total_votes,
          review: landmark.average_out_of_10,
        })),
        popularLandmarks: data.data.popular_landmarks.map((landmark) => ({
          lat: landmark.latitude,
          long: landmark.longitude,
          name: landmark.tag,
          distance: landmark.distance,
          votes: landmark.total_votes,
          review: landmark.average_out_of_10,
        })),
      };
    } catch (error) {
      logToConsole(error);
    }
  }

  async fetchResortDetails() {
    await this.fetchResortDescription();
    await this.fetchResortPolicies();
    await this.fetchResortPopularLandmarks();
  }
}
export default BookingAPIFetcher;
