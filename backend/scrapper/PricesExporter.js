import axios from "axios";
import colors from "colors";

import { findPlatformPrice } from "../utils/functions.js";
import Listing from "../models/listingModel.js";

class PricesExporter {
  constructor(businessData) {
    this.operationStatus = "";
    this.businessData = businessData;

    this.acfExportObject = {
      acf: {
        banner_width: "Full",
      },
    };
  }

  async init() {
    try {
      this.businessData = await Listing.findById(this.businessData._id);
      if (!this.businessData) {
        throw new Error("Listing not found while updating prices");
      }
      this.exportAffiliate();
      await this.addACFFieldsData();
    } catch (error) {
      console.error(
        colors.red("Error exporting new prices to Yeeew!:" + error)
      );
    }
  }

  async addACFFieldsData() {
    try {
      const yeeewDevApiUrl =
        process.env.YEEEW_DEV_REST_API_URL + "/wp-json/wp/v2/job_listing";
      const yeeewApiUrl =
        process.env.YEEEW_REST_API_URL + "/wp-json/wp/v2/job-listings";

      if (this.businessData.yeeewDevPostId) {
        try {
          await axios.post(
            yeeewDevApiUrl + `/${this.businessData.yeeewDevPostId}`,
            this.acfExportObject,
            {
              headers: {
                Authorization: `Basic ${process.env.YEEEW_DEV_REST_API_PASSWORD}`,
                "Content-Type": "application/json",
              },
            }
          );
        } catch (error) {
          console.error("Could not export new prices to Yeeew Dev");
        }
      }

      if (this.businessData.yeeewPostId) {
        try {
          await axios.post(
            yeeewApiUrl + `/${this.businessData.yeeewPostId}`,
            this.acfExportObject,
            {
              headers: {
                Authorization: `Basic ${process.env.YEEEW_REST_API_PASSWORD}`,
                "Content-Type": "application/json",
              },
            }
          );
        } catch (error) {
          console.error("Could not export new prices to Yeeew");
        }
      }
    } catch (error) {
      console.error(
        error.response && error.response.data.message
          ? colors.red(error.response.data.message)
          : colors.red(`Error adding ACF fields data: ${error.message}`)
      );
    }
  }

  exportAffiliate() {
    try {
      const affiliates = [];
      if (this.businessData.perfectWave.link) {
        affiliates.push({
          affiliate_name: 1862,
          listing_url: this.businessData.perfectWave.link
            ? this.businessData.perfectWave.link
            : null,
          package_price: this.businessData.perfectWave.minimum_price,
          package_number_of_days: this.businessData.perfectWave.nights,
        });
      }
      if (this.businessData.luex.link) {
        affiliates.push({
          affiliate_name: 1873,
          listing_url: this.businessData.luex.link
            ? this.businessData.luex.link
            : null,
          package_price: this.businessData.luex.minimum_price
            ? this.businessData.luex.minimum_price
            : "",
          package_number_of_days: this.businessData.luex.nights
            ? this.businessData.luex.nights
            : "",
        });
      }
      if (this.businessData.waterways.link) {
        affiliates.push({
          affiliate_name: 1864,
          listing_url: this.businessData.waterways.link
            ? this.businessData.waterways.link
            : null,
          package_price: this.businessData.waterways.minimum_price
            ? this.businessData.waterways.minimum_price
            : "",
          package_number_of_days: this.businessData.waterways.nights
            ? this.businessData.waterways.nights
            : "",
        });
      }
      if (this.businessData.worldSurfaris.link) {
        affiliates.push({
          affiliate_name: 1869,
          listing_url: this.businessData.worldSurfaris.link
            ? this.businessData.worldSurfaris.link
            : null,
          package_price: this.businessData.worldSurfaris.minimum_price
            ? this.businessData.worldSurfaris.minimum_price
            : "",
          package_number_of_days: this.businessData.worldSurfaris.nights
            ? this.businessData.worldSurfaris.nights
            : "",
        });
      }
      if (this.businessData.atollTravel.link) {
        affiliates.push({
          affiliate_name: 1874,
          listing_url: this.businessData.atollTravel.link
            ? this.businessData.atollTravel.link
            : null,
          package_price: this.businessData.atollTravel.minimum_price
            ? this.businessData.atollTravel.minimum_price
            : "",
          package_number_of_days: this.businessData.atollTravel.nights
            ? this.businessData.atollTravel.nights
            : "",
        });
      }
      if (this.businessData.surfHolidays.link) {
        affiliates.push({
          affiliate_name: 1865,
          listing_url: this.businessData.surfHolidays.link
            ? this.businessData.surfHolidays.link
            : null,
          package_price: this.businessData.surfHolidays.minimum_price
            ? this.businessData.surfHolidays.minimum_price
            : "",
          package_number_of_days: this.businessData.surfHolidays.nights
            ? this.businessData.surfHolidays.nights
            : "",
        });
      }
      if (this.businessData.surfline.link) {
        affiliates.push({
          affiliate_name: 3869,
          listing_url: this.businessData.surfline.link
            ? this.businessData.surfline.link
            : null,

          package_price: this.businessData.surfline.minimum_price
            ? this.businessData.surfline.minimum_price
            : "",
          package_number_of_days: this.businessData.surfline.nights
            ? this.businessData.surfline.nights
            : "",
        });
      }
      if (this.businessData.lushPalm.link) {
        affiliates.push({
          affiliate_name: 3870,
          listing_url: this.businessData.lushPalm.link
            ? this.businessData.lushPalm.link
            : null,

          package_price: this.businessData.lushPalm.minimum_price
            ? this.businessData.lushPalm.minimum_price
            : "",
          package_number_of_days: this.businessData.lushPalm.nights
            ? this.businessData.lushPalm.nights
            : "",
        });
      }
      if (this.businessData.thermal.link) {
        affiliates.push({
          affiliate_name: 3871,
          listing_url: this.businessData.thermal.link
            ? this.businessData.thermal.link
            : null,

          package_price: this.businessData.thermal.minimum_price
            ? this.businessData.thermal.minimum_price
            : "",
          package_number_of_days: this.businessData.thermal.nights
            ? this.businessData.thermal.nights
            : "",
        });
      }
      if (this.businessData.bookSurfCamps.link) {
        affiliates.push({
          affiliate_name: 3872,
          listing_url: this.businessData.bookSurfCamps.link
            ? this.businessData.bookSurfCamps.link
            : null,

          package_price: this.businessData.bookSurfCamps.minimum_price
            ? this.businessData.bookSurfCamps.minimum_price
            : "",
          package_number_of_days: this.businessData.bookSurfCamps.nights
            ? this.businessData.bookSurfCamps.nights
            : "",
        });
      }
      if (this.businessData.nomadSurfers.link) {
        affiliates.push({
          affiliate_name: 3873,
          listing_url: this.businessData.nomadSurfers.link
            ? this.businessData.nomadSurfers.link
            : null,

          package_price: this.businessData.nomadSurfers.minimum_price
            ? this.businessData.nomadSurfers.minimum_price
            : "",
          package_number_of_days: this.businessData.nomadSurfers.nights
            ? this.businessData.nomadSurfers.nights
            : "",
        });
      }
      if (this.businessData.stokedSurfAdventures.link) {
        affiliates.push({
          affiliate_name: 3874,
          listing_url: this.businessData.stokedSurfAdventures.link
            ? this.businessData.stokedSurfAdventures.link
            : null,

          package_price: this.businessData.stokedSurfAdventures.minimum_price
            ? this.businessData.stokedSurfAdventures.minimum_price
            : "",
          package_number_of_days: this.businessData.stokedSurfAdventures.nights
            ? this.businessData.stokedSurfAdventures.nights
            : "",
        });
      }
      if (this.businessData.soulSurfTravel.link) {
        affiliates.push({
          affiliate_name: 3875,
          listing_url: this.businessData.soulSurfTravel.link
            ? this.businessData.soulSurfTravel.link
            : null,

          package_price: this.businessData.soulSurfTravel.minimum_price
            ? this.businessData.soulSurfTravel.minimum_price
            : "",
          package_number_of_days: this.businessData.soulSurfTravel.nights
            ? this.businessData.soulSurfTravel.nights
            : "",
        });
      }
      if (this.businessData.surfersHype.link) {
        affiliates.push({
          affiliate_name: 3877,
          listing_url: this.businessData.surfersHype.link
            ? this.businessData.surfersHype.link
            : null,

          package_price: this.businessData.surfersHype.minimum_price
            ? this.businessData.surfersHype.minimum_price
            : "",
          package_number_of_days: this.businessData.surfersHype.nights
            ? this.businessData.surfersHype.nights
            : "",
        });
      }

      if (this.businessData.apiData) {
        const agodaPrice = findPlatformPrice(
          this.businessData.apiData,
          "agoda"
        );
        if (this.businessData.apiData.agoda || agodaPrice) {
          affiliates.push({
            affiliate_name: 1867,
            affiliate_id: this.businessData.apiData.agoda?.id
              ? this.businessData.apiData.agoda.id
              : null,
            listing_url: this.businessData.apiData.agoda?.data?.url
              ? this.businessData.apiData.agoda.data.url
              : this.businessData.agoda && this.businessData.agoda.link
              ? this.businessData.agoda.link
              : null,
            ...(agodaPrice && {
              listing_actual_price_per_day: String(agodaPrice),
            }),
          });
        }
        if (this.businessData.apiData.tripadvisor) {
          affiliates.push({
            affiliate_name: 3878,
            api_id: "https://tripadvisor-com1.p.rapidapi.com",
            affiliate_id: this.businessData.apiData.tripadvisor.id,
            listing_url:
              this.businessData.apiData.tripadvisor.data?.webUrl || "",
          });
        }
        if (this.businessData.apiData.hotels) {
          const hotelsPrice = findPlatformPrice(
            this.businessData.apiData,
            "hotels"
          )
            ? findPlatformPrice(this.businessData.apiData, "hotels")
            : this.businessData.apiData.hotels.data.minimumPrice;

          affiliates.push({
            affiliate_name: 1875,
            api_id: "https://hotels-com-provider.p.rapidapi.com",
            affiliate_id: this.businessData.apiData.hotels.id,
            ...(hotelsPrice && {
              listing_actual_price_per_day: String(hotelsPrice),
            }),
          });
        }
        if (this.businessData.apiData.priceline) {
          const pricelinePrice = findPlatformPrice(
            this.businessData.apiData,
            "priceline"
          );
          affiliates.push({
            affiliate_name: 3883,
            api_id: "https://priceline-com-provider.p.rapidapi.com",
            affiliate_id: this.businessData.apiData.priceline.id,
            ...(pricelinePrice && {
              listing_actual_price_per_day: String(pricelinePrice),
              listing_url: `https://www.priceline.com/hotel-deals/h${this.businessData.apiData.priceline.id}`,
            }),
          });
        }
        if (this.businessData.apiData.booking) {
          const bookingPrice = findPlatformPrice(
            this.businessData.apiData,
            "booking"
          )
            ? findPlatformPrice(this.businessData.apiData, "booking")
            : this.businessData.apiData.booking.data.details?.price
                ?.grossAmountPerNight || null;
          affiliates.push({
            affiliate_name: 1866,
            api_id: "https://booking-com15.p.rapidapi.com",
            affiliate_id: this.businessData.apiData.booking.id,
            ...(this.businessData?.apiData?.booking?.data?.details?.url && {
              listing_url: this.businessData.apiData.booking.data.details.url,
            }),
            ...(bookingPrice && {
              listing_actual_price_per_day: String(bookingPrice),
            }),
          });
        }

        //if we're getting the trip.com price from the TripAdvisor API:
        const tripPrice = findPlatformPrice(
          this.businessData.apiData,
          "Trip.com"
        );
        if (tripPrice) {
          affiliates.push({
            affiliate_name: 3881,
            listing_url: this.businessData.trip
              ? this.businessData.trip.link
              : "",
            listing_actual_price_per_day: String(tripPrice),
          });
        }
      }

      if (affiliates.length) {
        this.acfExportObject.acf["listing_pricing_option"] = "affiliate_prices";
        this.acfExportObject.acf["affiliate_price_box"] = affiliates;
      }
    } catch (error) {
      console.error(colors.red("Error exporting affiliates:" + error));

      if (error.response) {
        this.logError(
          "Error exporting affiliates:" + error.response.data.message
            ? error.response.data.message
            : error.message
            ? error.message
            : error
        );
      } else {
        this.logError("Error exporting affiliates:" + error.message);
      }
    }
  }
}

export default PricesExporter;
