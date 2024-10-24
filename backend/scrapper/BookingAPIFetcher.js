import axios from "axios";
import { logToConsole } from "../utils/functions.js";
class BookingAPIFetcher {
  constructor(businessName, entityId) {
    this.businessName = businessName;
    this.entityId = entityId ? entityId : "";
    this.coordinates = {
      lat: "",
      long: "",
    };

    this.description = null;
    this.policies = null;
    this.landmarks = null;
    this.details = null;
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
          description: this.description,
          policies: this.policies,
          landmarks: this.landmarks,
          coordinates: this.coordinates,
          details: this.details,
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
        this.entityId = data.data[0].dest_id;
        if (this.entityId) await this.fetchResortDetails();
      }
    } catch (error) {
      logToConsole(error);
    }
  }

  async fetchHotelDetails(numberOfDaysToAdd = 3) {
    const now = new Date();
    const options = {
      method: "GET",
      url: "https://booking-com15.p.rapidapi.com/api/v1/hotels/getHotelDetails",
      params: {
        hotel_id: this.entityId,
        languagecode: "en-us",
        arrival_date: new Date(now.setDate(now.getDate() + numberOfDaysToAdd))
          .toISOString()
          .split("T")[0],
        departure_date: new Date(
          now.setDate(now.getDate() + numberOfDaysToAdd + 1)
        )
          .toISOString()
          .split("T")[0],
        units: "metric",
        temperature_unit: "c",
      },
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "booking-com15.p.rapidapi.com",
      },
    };
    try {
      const { data } = await axios.request(options);
      this.coordinates = {
        lat: `${data.data?.latitude}`,
        long: `${data.data?.longitude}`,
      };
      const details = {
        price: {
          productPrice:
            data.data?.product_price_breakdown?.gross_amount?.value || null,
          grossAmountPerNight:
            data.data?.product_price_breakdown?.gross_amount_per_night?.value ||
            null,
          allInclusiveAmount:
            data.data?.product_price_breakdown?.all_inclusive_amount?.value ||
            null,
          excludedAmount:
            data.data?.product_price_breakdown?.excluded_amount?.value || null,
          grossAmountHotelCurrency:
            data.data?.product_price_breakdown?.gross_amount_hotel_currency
              ?.value || null,
          compositeGrossAmountPerNight:
            data.data?.composite_price_breakdown?.gross_amount_per_night
              ?.value || null,
          compositeAllInclusiveAmount:
            data.data?.composite_price_breakdown?.all_inclusive_amount?.value ||
            null,
          compositeExcludedAmount:
            data.data?.composite_price_breakdown?.excluded_amount?.value ||
            null,
          taxesAndCharges:
            data.data?.product_price_breakdown?.charges_details
              ?.translated_copy || null,
        },
        url: data.data?.url || null,
        businessInformation: {
          hotelName: data.data?.hotel_name || null,
          address: data.data?.address || null,
          city: data.data?.city || null,
          country: data.data?.country_trans || null,
          rating: data.data?.breakfast_review_score?.rating || null,
          reviewNumber: data.data?.review_nr || null,
          facilities:
            data.data?.facilities_block?.facilities?.map(
              (facility) => facility.name
            ) || [],
          sustainability:
            data.data?.sustainability?.sustainability_page?.title || null,
        },
      };
      this.details = details;
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
    await this.fetchHotelDetails();
  }
}
export default BookingAPIFetcher;
