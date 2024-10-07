import axios from "axios";
import path from "path";
import { mappedLocationStructure } from "./constants.js";
import Operation from "../models/operationModel.js";
import colors from "colors";
import {
  amenitiesMasterListDev,
  amenitiesMasterListLive,
} from "./constants.js";

import fetch from "node-fetch";
import FormData from "form-data";
import Listing from "../models/listingModel.js";
import { formatDate } from "../utils/functions.js";

class Export {
  constructor(businessData, operationId) {
    this.operationStatus = "";
    this.businessData = businessData;
    this.operationId = operationId;
    this.jobListingTypeTaxonomy = [193];
    this.createdPostID = "";
    this.featuredImageId = "";
    this.exportToYeeewTest = false;

    //Latitude and longitude:
    // 1. If an API data is present, get it from that,
    // 2. Else, use google data
    // 3. Else use geolocation:
    let latFromAPI = "";
    let longFromAPI = "";
    if (this.businessData._doc.apiData) {
      const findFirstCoordinatesData = Object.keys(
        this.businessData._doc.apiData
      ).find(
        (key) =>
          this.businessData._doc.apiData[key].data &&
          this.businessData._doc.apiData[key].data.coordinates
      );
      if (findFirstCoordinatesData) {
        latFromAPI =
          this.businessData._doc.apiData[findFirstCoordinatesData].data
            .coordinates.lat;
        longFromAPI =
          this.businessData._doc.apiData[findFirstCoordinatesData].data
            .coordinates.long;
      }
    }

    this.exportObject = {
      title: businessData.businessName ? businessData.businessName : "",
      status: "draft",
      type: "job_listing",
      excerpt: businessData.overview ? businessData.overview : "",
      job_listing_type: this.jobListingTypeTaxonomy,
      meta: {
        _job_location: businessData.address ? businessData.address : "",
        geolocation_lat: latFromAPI
          ? latFromAPI
          : businessData.latitude
          ? businessData.latitude.toString()
          : "",
        geolocation_long: longFromAPI
          ? longFromAPI
          : businessData.longitude
          ? businessData.longitude.toString()
          : "",
        _application: businessData.email ? businessData.email : "",
        _phone: businessData.phoneNumber
          ? businessData.phoneNumber
          : "" + " " + businessData.whatsappNumber
          ? businessData.whatsappNumber
          : "",
      },
    };

    this.acfExportObject = {
      acf: {
        seo_dynamic_text_string: businessData.overview
          ? businessData.overview
          : "",
        what_it_is_like: businessData.overview ? businessData.overview : "",
        getting_there: businessData.gettingThere
          ? businessData.gettingThere
          : "",
        about_accomadation: businessData.aboutAccomodation
          ? businessData.aboutAccomodation
          : "",
        "seasons_&_forecast": businessData.specificSurfSpots
          ? businessData.specificSurfSpots
          : "",
        "inclusions_&_food": businessData.foodInclusions
          ? businessData.foodInclusions
          : "",
      },
    };
  }

  async downloadImage(imageUrl) {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });
    return Buffer.from(response.data, "binary");
  }

  async uploadImageToWordPress(imageData, imageName) {
    const yeeewApiUrl = this.exportToYeeewTest
      ? process.env.YEEEW_DEV_REST_API_URL
      : process.env.YEEEW_REST_API_URL;

    const form = new FormData();
    form.append("file", imageData, { filename: imageName });

    const response = await fetch(yeeewApiUrl + "/wp-json/wp/v2/media", {
      method: "POST",
      headers: {
        Authorization: `Basic ${
          this.exportToYeeewTest
            ? process.env.YEEEW_DEV_REST_API_PASSWORD
            : process.env.YEEEW_REST_API_PASSWORD
        }`,
      },
      body: form,
    });

    const data = await response.json();

    return data.id;
  }

  async processImage(imageUrl) {
    try {
      const imageData = await this.downloadImage(imageUrl);
      const fileExtension = path.extname(imageUrl);
      const imageName = `image_${new Date().getTime()}${fileExtension}`;

      const imageId = await this.uploadImageToWordPress(imageData, imageName);
      this.featuredImageId = imageId;
    } catch (error) {
      console.error(`Error processing image: ${error}`.red);
    }
  }

  async init() {
    try {
      await this.updateOperationStatus();
      if (this.operationStatus != "cancelled") {
        //Keep going if the operation is not cancelled yet:
        this.processBusinessData();
        //Upload featured Image:
        if (this.businessData.scrapedImages.length) {
          await this.processImage(this.businessData.scrapedImages[0]);
        }
        await this.createBusinessOnYeeew();
        await this.addACFFieldsData();
        await this.updateListing();
        await this.updateOperation();
      }
    } catch (error) {
      console.error(
        colors.red("Error exporting business data to Yeeew!:" + error)
      );

      if (error.response) {
        await this.logError(
          "Error exporting business data to Yeeew!:" +
            error.response.data.message
            ? error.response.data.message
            : error.message
            ? error.message
            : error
        );
      } else {
        await this.logError(
          "Error exporting business data to Yeeew!:" + error.message
        );
      }
    }
  }

  processBusinessData() {
    try {
      this.accommodationTypeTaxonomies();
      this.tripTypeTaxonomies();
      this.highlightsTaxonomies();
      this.exportFAQs();
      this.exportRooms();
      this.exportAmenities();
      this.exportAffiliate();
      this.exportTripAdvisorReviews();
      this.exportImagesToGallery();
      this.exportSurroundings();
      this.selectionLocationTaxonomies();
    } catch (error) {
      console.error(colors.red("Error processing business data:" + error));

      if (error.response) {
        this.logError(
          "Error processing business data:" + error.response.data.message
            ? error.response.data.message
            : error.message
            ? error.message
            : error
        );
      } else {
        this.logError("Error processing business data:" + error.message);
      }
    }
  }

  async createBusinessOnYeeew() {
    if (this.featuredImageId) {
      this.exportObject.featured_media = this.featuredImageId;
    }
    try {
      let yeeewApiUrl = this.exportToYeeewTest
        ? process.env.YEEEW_DEV_REST_API_URL + "/wp-json/wp/v2/job_listing"
        : process.env.YEEEW_REST_API_URL + "/wp-json/wp/v2/job-listings";
      const { data } = await axios.post(yeeewApiUrl, this.exportObject, {
        headers: {
          Authorization: `Basic ${
            this.exportToYeeewTest
              ? process.env.YEEEW_DEV_REST_API_PASSWORD
              : process.env.YEEEW_REST_API_PASSWORD
          }`,
          "Content-Type": "application/json",
        },
      });
      this.createdPostID = data.id;
      console.log(`POST ID: ${data.id}`.green.inverse);
    } catch (error) {
      console.error(colors.red("Error creating business on Yeeew:" + error));

      if (error.response) {
        await this.logError(
          "Error creating business on Yeeew:" + error.response.data.message
            ? error.response.data.message
            : error.message
            ? error.message
            : error
        );
      } else {
        await this.logError(
          "Error creating business on Yeeew:" + error.message
        );
      }
    }
  }
  async addACFFieldsData() {
    try {
      const yeeewApiUrl = this.exportToYeeewTest
        ? process.env.YEEEW_DEV_REST_API_URL + "/wp-json/wp/v2/job_listing"
        : process.env.YEEEW_REST_API_URL + "/wp-json/wp/v2/job-listings";

      await axios.post(
        yeeewApiUrl + `/${this.createdPostID}`,
        this.acfExportObject,
        {
          headers: {
            Authorization: `Basic ${
              this.exportToYeeewTest
                ? process.env.YEEEW_DEV_REST_API_PASSWORD
                : process.env.YEEEW_REST_API_PASSWORD
            }`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error(
        error.response && error.response.data.message
          ? colors.red(error.response.data.message)
          : colors.red(`Error adding ACF fields data: ${error.message}`)
      );

      if (error.response) {
        await this.logError(
          "Error adding ACF fields data:" + error.response.data.message
            ? error.response.data.message
            : error.message
            ? error.message
            : error
        );
      } else {
        await this.logError("Error adding ACF fields data:" + error.message);
      }
    }
  }

  accommodationTypeTaxonomies() {
    try {
      if (!this.businessData.accommodationType) return;
      const accommodationTypeTaxonomies = [];
      this.businessData.accommodationType.forEach((item) => {
        if (item.toLowerCase().includes("boat"))
          accommodationTypeTaxonomies.push(54);
        if (item.toLowerCase().includes("cabin"))
          accommodationTypeTaxonomies.push(55);
        if (item.toLowerCase().includes("rental accomodation"))
          accommodationTypeTaxonomies.push(58);
        if (item.toLowerCase().includes("rental campervan"))
          accommodationTypeTaxonomies.push(281);
        if (item.toLowerCase().includes("hostel"))
          accommodationTypeTaxonomies.push(this.exportToYeeewTest ? 56 : 3886);
        if (item.toLowerCase().includes("hotel"))
          accommodationTypeTaxonomies.push(this.exportToYeeewTest ? 57 : 3885);
        if (
          item.toLowerCase().includes("mobile tour") &&
          !this.exportToYeeewTest
        )
          accommodationTypeTaxonomies.push(3888);
        if (item.toLowerCase().includes("villa"))
          accommodationTypeTaxonomies.push(3887);
      });
      if (accommodationTypeTaxonomies.length) {
        this.acfExportObject.acf["accommodation_type"] =
          accommodationTypeTaxonomies;
      }
    } catch (error) {
      console.error(
        colors.red("Error setting accommodation type taxonomies:" + error)
      );

      if (error.response) {
        this.logError(
          "Error setting accommodation type taxonomies:" +
            error.response.data.message
            ? error.response.data.message
            : error.message
            ? error.message
            : error
        );
      } else {
        this.logError(
          "Error setting accommodation type taxonomies:" + error.message
        );
      }
    }
  }

  tripTypeTaxonomies() {
    try {
      if (!this.businessData.tripType) return;

      const tripTypeTaxonomies = [];
      this.businessData.tripType.forEach((item) => {
        if (item.toLowerCase().includes("couple & honeymoon"))
          tripTypeTaxonomies.push(60);
        if (item.toLowerCase().includes("family holiday"))
          tripTypeTaxonomies.push(59);
        if (item.toLowerCase().includes("intrepid adventurers"))
          tripTypeTaxonomies.push(65);
        if (item.toLowerCase().includes("learn to surf"))
          tripTypeTaxonomies.push(66);
        if (item.toLowerCase().includes("luxury holiday"))
          tripTypeTaxonomies.push(61);
        if (item.toLowerCase().includes("mates trip"))
          tripTypeTaxonomies.push(62);
        if (item.toLowerCase().includes("strike missions"))
          tripTypeTaxonomies.push(63);
        if (item.toLowerCase().includes("surfing in comfort"))
          tripTypeTaxonomies.push(64);
      });
      if (tripTypeTaxonomies.length) {
        this.acfExportObject.acf["type_of_trip"] = tripTypeTaxonomies;
      }
    } catch (error) {
      console.error(colors.red("Error setting trip type taxonomies:" + error));

      if (error.response) {
        this.logError(
          "Error setting trip type taxonomies:" + error.response.data.message
            ? error.response.data.message
            : error.message
            ? error.message
            : error
        );
      } else {
        this.logError("Error setting trip type taxonomies:" + error.message);
      }
    }
  }

  highlightsTaxonomies() {
    try {
      if (!this.businessData.highlightsAndTopAmenities) return;
      const repeaterHighlights = [];
      this.businessData.highlightsAndTopAmenities.forEach((highlight) => {
        repeaterHighlights.push({
          highlight_icon: null,
          highlights: highlight,
        });
      });

      if (repeaterHighlights.length) {
        this.acfExportObject.acf["resort_highlights"] = repeaterHighlights;
      }
    } catch (error) {
      console.error(colors.red("Error setting highlights taxonomies:" + error));

      if (error.response) {
        this.logError(
          "Error setting highlights taxonomies:" + error.response.data.message
            ? error.response.data.message
            : error.message
            ? error.message
            : error
        );
      } else {
        this.logError("Error setting highlights taxonomies:" + error.message);
      }
    }
  }

  exportTripAdvisorReviews() {
    if (
      !this.businessData.apiData ||
      !this.businessData.apiData.tripadvisor ||
      !this.businessData.apiData.tripadvisor.data.reviews
    )
      return;
    try {
      let repeaterReviews = this.businessData.apiData.tripadvisor.data.reviews;
      if (this.businessData.apiData.tripadvisor.data.totalReviews) {
        this.acfExportObject.acf["tripadvisor_review_count"] =
          this.businessData.apiData.tripadvisor.data.totalReviews;
      }
      if (this.businessData.apiData.tripadvisor.data.rating) {
        this.acfExportObject.acf["tripadvisor_review_rating"] =
          this.businessData.apiData.tripadvisor.data.rating;
      }
      if (repeaterReviews.length) {
        this.acfExportObject.acf["reviews"] = repeaterReviews.map((item) => {
          const obj = {
            review_title: item.reviewTitle,
            review_text: item.reviewText,
            review_stars: item.reviewRating,
            reviewer_name:
              item.userProfile && item.userProfile.displayName
                ? item.userProfile.displayName
                : "",
            reviewers_image:
              item.userProfile && item.userProfile.avatar
                ? item.userProfile.avatar
                : "",
            approved: true,
          };

          if (item.publishedDate) {
            const dateString = item.publishedDate.split("Written ")[1];
            try {
              const date = new Date(dateString);
              if (date && date != "Invalid Date") {
                obj.time = formatDate(date);
              }
            } catch (error) {
              console.log(
                "Something went wrong while exporting review data",
                error
              );
            }
          }

          return obj;
        });
      }
    } catch (error) {
      console.error(colors.red("Error exporting FAQs:" + error));

      if (error.response) {
        this.logError(
          "Error exporting FAQs:" + error.response.data.message
            ? error.response.data.message
            : error.message
            ? error.message
            : error
        );
      } else {
        this.logError("Error exporting FAQs:" + error.message);
      }
    }
  }
  exportFAQs() {
    if (!this.businessData.faq) return;
    try {
      let repeaterFAQ = this.businessData.faq;
      if (repeaterFAQ.length) {
        this.acfExportObject.acf["faq_section"] = this.exportToYeeewTest
          ? repeaterFAQ
          : repeaterFAQ.map((fa) => ({
              faq_question: fa.faq_question,
              eaq_answer: fa.faq_answer,
            }));
      }
    } catch (error) {
      console.error(colors.red("Error exporting FAQs:" + error));

      if (error.response) {
        this.logError(
          "Error exporting FAQs:" + error.response.data.message
            ? error.response.data.message
            : error.message
            ? error.message
            : error
        );
      } else {
        this.logError("Error exporting FAQs:" + error.message);
      }
    }
  }

  exportRooms() {
    if (!this.businessData.roomsFromBooking) return;
    try {
      let repeaterRooms = this.businessData.roomsFromBooking;
      if (repeaterRooms.length) {
        //For now, just store names:
        this.acfExportObject.acf["room_types"] = repeaterRooms.map((room) => ({
          room_image: null,
          room_type: room.roomName,
        }));
      }
    } catch (error) {
      console.error(colors.red("Error exporting rooms:" + error));

      if (error.response) {
        this.logError(
          "Error exporting rooms:" + error.response.data.message
            ? error.response.data.message
            : error.message
            ? error.message
            : error
        );
      } else {
        this.logError("Error exporting rooms:" + error.message);
      }
    }
  }

  getAmenitiesTaxonomyArray(amenities) {
    if (!amenities.length) return null;

    const amenitiesTaxonomies = this.exportToYeeewTest
      ? amenities.map((amenity) =>
          amenitiesMasterListDev.find(
            (item) => item.name.toLowerCase() === amenity.toLowerCase()
          )
        )
      : amenities.map((amenity) =>
          amenitiesMasterListLive.find(
            (item) => item.name.toLowerCase() === amenity.toLowerCase()
          )
        );

    return amenitiesTaxonomies
      .filter((item) => item && item.id)
      .map((item) => item.id.toString());
  }

  exportImagesToGallery() {
    let images = this.businessData.scrapedImages;
    //If images length is inadequate, fill the ranks with images scrapped from APIs
    if (images.length < 20) {
      if (this.businessData.apiData) {
        const newImagesArr = [];
        const hotelGallery =
          this.businessData.apiData?.hotels?.data?.propertyGallery;
        const pricelineGallery =
          this.businessData.apiData?.priceline?.data?.propertyGallery;

        if (hotelGallery) {
          newImagesArr.push(...hotelGallery.map((gal) => gal.url));
        }

        if (pricelineGallery) {
          newImagesArr.push(...pricelineGallery.map((gal) => gal.imageUrl));
        }

        newImagesArr.forEach((im) => {
          if (images.length < 30) {
            images.push(im);
          }
        });
      }
    }

    if (images.length) {
      //For now, just store names:
      this.acfExportObject.acf["image_gallery"] = images.map((image) => ({
        image_gallery_listing: image,
      }));
    }
  }

  exportAffiliate() {
    try {
      const affiliates = [];
      // if (this.businessData.agoda.link) {
      //   affiliates.push({
      //     affiliate_name: 1867,
      //     listing_url: this.businessData.agoda.link
      //       ? this.businessData.agoda.link
      //       : null,
      //     package_price: "",
      //     package_number_of_days: "",
      //   });
      // }
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
        if (this.businessData.apiData.agoda) {
          affiliates.push({
            affiliate_name: 1867,
            affiliate_id: this.businessData.apiData.agoda.id
              ? this.businessData.apiData.agoda.id
              : null,
            listing_url: this.businessData.apiData.agoda.data.url
              ? this.businessData.apiData.agoda.data.url
              : null,
          });
        }
        if (this.businessData.apiData.tripadvisor) {
          affiliates.push({
            affiliate_name: 3878,
            api_id: "https://tripadvisor-com1.p.rapidapi.com",
            affiliate_id: this.businessData.apiData.tripadvisor.id,
          });
        }
        if (this.businessData.apiData.hotels) {
          affiliates.push({
            affiliate_name: 1875,
            api_id: "https://hotels-com-provider.p.rapidapi.com",
            affiliate_id: this.businessData.apiData.hotels.id,
          });
        }
        if (this.businessData.apiData.priceline) {
          affiliates.push({
            affiliate_name: 3883,
            api_id: "https://priceline-com-provider.p.rapidapi.com",
            affiliate_id: this.businessData.apiData.priceline.id,
          });
        }
        if (this.businessData.apiData.booking) {
          affiliates.push({
            affiliate_name: 1866,
            api_id: "https://booking-com15.p.rapidapi.com",
            affiliate_id: this.businessData.apiData.booking.id,
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
  exportAmenities() {
    if (!this.businessData.propertyAmenitiesFromBooking) return;

    try {
      let repeaterAmenities = this.businessData.propertyAmenitiesFromBooking;
      if (repeaterAmenities.length) {
        //For now, just store names:
        this.acfExportObject.acf["property_amenities"] = repeaterAmenities.map(
          (amenity) => {
            const amenitiesTaxonomyArr = this.getAmenitiesTaxonomyArray(
              amenity.amenities
            );

            return {
              aminity_icon: null,
              amenity_description: amenity.type,
              amenity_list: amenitiesTaxonomyArr.length
                ? amenitiesTaxonomyArr
                : null,
            };
          }
        );

        console.log(this.acfExportObject.acf["property_amenities"]);
      }
    } catch (error) {
      console.error(colors.red("Error exporting amenities:" + error));

      if (error.response) {
        this.logError(
          "Error exporting amenities:" + error.response.data.message
            ? error.response.data.message
            : error.message
            ? error.message
            : error
        );
      } else {
        this.logError("Error exporting amenities:" + error.message);
      }
    }
  }

  exportSurroundings() {
    if (!this.businessData.propertySurroundingsFromBooking) return;

    try {
      let repeaterSurroundings =
        this.businessData.propertySurroundingsFromBooking;
      if (repeaterSurroundings.length) {
        //For now, just store names:
        this.acfExportObject.acf["property_surroundings"] =
          repeaterSurroundings.map((surrounding) => ({
            surrounding_icon: null,
            property_surrounding_type: surrounding.surroundingType,
            property_surroundings_details: surrounding.surroundings.map(
              (subsurounding) => ({
                surroundings_type: subsurounding.type,
                surroundings_name: subsurounding.name,
                surroundings_distance: subsurounding.distance,
              })
            ),
          }));
      }
    } catch (error) {
      console.error(colors.red("Error exporting surroundings:" + error));

      if (error.response) {
        this.logError(
          "Error exporting surroundings:" + error.response.data.message
            ? error.response.data.message
            : error.message
            ? error.message
            : error
        );
      } else {
        this.logError("Error exporting surroundings:" + error.message);
      }
    }
  }

  selectionLocationTaxonomies() {
    try {
      if (this.businessData.customSlug) {
        const locationTaxonomies = [];
        const slugArray = this.businessData.customSlug.split("/");
        slugArray.forEach((slug, index) => {
          if (index === slugArray.length - 1) {
            return;
          }
          const foundId = this.findLocationTaxonomy(slug);
          if (foundId) locationTaxonomies.push(foundId);

          this.exportObject["job_listing_region"] = locationTaxonomies;
        });
      }
    } catch (error) {
      console.error(colors.red("Error selecting location taxonomies:" + error));

      if (error.response) {
        this.logError(
          "Error selecting location taxonomies:" + error.response.data.message
            ? error.response.data.message
            : error.message
            ? error.message
            : error
        );
      } else {
        this.logError("Error selecting location taxonomies:" + error.message);
      }
    }
  }

  searchTree(node, targetSlug) {
    try {
      if (node.slug === targetSlug) {
        return node.id;
      }

      // Iterate over each key in the current node
      for (let i = 0; i < node.items.length; i++) {
        const item = node.items[i];
        const result = this.searchTree(item, targetSlug);
        // If the result is found, return it
        if (result !== undefined) {
          return result;
        }
      }

      // If the target is not found, return undefined
      return undefined;
    } catch (error) {
      console.error(colors.red("Error searching tree:" + error));

      if (error.response) {
        this.logError(
          "Error searching tree:" + error.response.data.message
            ? error.response.data.message
            : error.message
            ? error.message
            : error
        );
      } else {
        this.logError("Error searching tree:" + error.message);
      }
    }
  }

  findLocationTaxonomy(slug) {
    try {
      let found;
      mappedLocationStructure.forEach((structure) => {
        if (typeof found == "undefined") {
          found = this.searchTree(structure, slug);
        }
        return found;
      });

      return found;
    } catch (error) {
      console.error(colors.red("Error finding location taxonomy:" + error));

      if (error.response) {
        this.logError(
          "Error finding location taxonomy:" + error.response.data.message
            ? error.response.data.message
            : error.message
            ? error.message
            : error
        );
      } else {
        this.logError("Error finding location taxonomy:" + error.message);
      }
    }
  }

  async updateOperationStatus() {
    try {
      const operation = await Operation.findById(this.operationId);
      if (typeof operation.exportToYeeewTest != "undefined") {
        this.exportToYeeewTest = operation.exportToYeeewTest;
      }

      if (operation.status === "cancelled") {
        //If operation has been cancelled, no need to proceed
        this.operationStatus = "cancelled";
        operation.finishedAt = new Date();
      } else if (operation.status == "queued") {
        //Running first time:
        operation.status = "running";
        operation.startedAt = new Date();
      }
      operation.save();
      console.log("Operation Status Updated".green);
    } catch (error) {
      console.error(colors.red("Error updating operation:" + error));
      if (error.response) {
        await this.logError(
          "Error updating operation:" + error.response.data.message
            ? error.response.data.message
            : error.message
            ? error.message
            : error
        );
      } else {
        await this.logError("Error updating operation:" + error.message);
      }
    }
  }

  async updateListing() {
    try {
      const yeeewApiUrl = this.exportToYeeewTest
        ? process.env.YEEEW_DEV_REST_API_URL
        : process.env.YEEEW_REST_API_URL;

      const exportedYeeewLink =
        yeeewApiUrl +
        `/wp-admin/post.php?post=${this.createdPostID}&action=edit`;
      const listing = await Listing.findByIdAndUpdate(
        this.businessData._id,
        {
          $push: { exportLinks: exportedYeeewLink },
          exported: true,
        },
        { new: true } // This option returns the modified document rather than the original
      );

      listing.save();

      console.log("Listing updated with export link".green);
    } catch (error) {
      console.error(colors.red("Error updating listing:" + error));

      if (error.response) {
        await this.logError(
          "Error updating listing:" + error.response.data.message
            ? error.response.data.message
            : error.message
            ? error.message
            : error
        );
      } else {
        await this.logError("Error updating listing:" + error.message);
      }
    }
  }
  async updateOperation() {
    try {
      const operation = await Operation.findByIdAndUpdate(
        this.operationId,
        {
          $push: { processedListingsId: this.businessData._id },
          $inc: { processedListings: 1 },
        },
        { new: true } // This option returns the modified document rather than the original
      );

      if (operation.processedListings === operation.totalListings) {
        operation.status = "finished";
        operation.finishedAt = new Date();
        operation.save();
      }

      console.log("Operation updated with processed listing ID".green);
    } catch (error) {
      console.error(colors.red("Error updating operation:" + error));

      if (error.response) {
        await this.logError(
          "Error updating operation:" + error.response.data.message
            ? error.response.data.message
            : error.message
            ? error.message
            : error
        );
      } else {
        await this.logError("Error updating operation:" + error.message);
      }
    }
  }

  async logError(error) {
    try {
      const operation = await Operation.findById(this.operationId);

      operation.errorListings = operation.errorListings || [];
      const listingIndex = operation.errorListings.findIndex(
        (item) => item.listingId === this.businessData._id
      );
      if (listingIndex != -1) {
        operation.errorListings[listingIndex].errors.push(error);
      } else {
        operation.errorListings.push({
          listingId: this.businessData._id,
          errors: [error],
        });
      }
      await operation.save();
      console.log("Error logged to the database".green);
    } catch (saveError) {
      console.error(colors.red("Error logging error:" + saveError));
    }
  }
}

export default Export;
