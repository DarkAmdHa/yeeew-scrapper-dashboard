import axios from "axios";
import path from "path";
import { mappedLocationStructure } from "./constants.js";
import Operation from "../models/operationModel.js";
import colors from "colors";
import { amenitiesMasterList } from "./constants.js";

import fetch from "node-fetch";
import FormData from "form-data";
import Listing from "../models/listingModel.js";

class Export {
  constructor(businessData, operationId) {
    this.operationStatus = "";
    this.businessData = businessData;
    this.operationId = operationId;
    this.jobListingTypeTaxonomy = [193];
    this.createdPostID = "";
    this.featuredImageId = "";

    this.exportObject = {
      title: businessData.businessName ? businessData.businessName : "",
      status: "draft",
      type: "job_listing",
      excerpt: businessData.overview ? businessData.overview : "",
      job_listing_type: this.jobListingTypeTaxonomy,
      meta: {
        _job_location: businessData.address ? businessData.address : "",
        geolocation_lat: businessData.latitude
          ? businessData.latitude.toString()
          : "",
        geolocation_long: businessData.longitude
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
    const form = new FormData();
    form.append("file", imageData, { filename: imageName });

    const response = await fetch(
      "https://yeewdev3.wpengine.com/wp-json/wp/v2/media",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${process.env.YEEEW_REST_API_PASSWORD}`,
        },
        body: form,
      }
    );

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
      this.accomodationTypeTaxonomies();
      this.tripTypeTaxonomies();
      this.highlightsTaxonomies();
      this.exportFAQs();
      this.exportRooms();
      this.exportAmenities();
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
      const { data } = await axios.post(
        "https://yeewdev3.wpengine.com/wp-json/wp/v2/job_listing",
        this.exportObject,
        {
          headers: {
            Authorization: `Basic ${process.env.YEEEW_REST_API_PASSWORD}`,
            "Content-Type": "application/json",
          },
        }
      );
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
      await axios.post(
        `https://yeewdev3.wpengine.com/wp-json/wp/v2/job_listing/${this.createdPostID}`,
        this.acfExportObject,
        {
          headers: {
            Authorization: `Basic ${process.env.YEEEW_REST_API_PASSWORD}`,
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

  accomodationTypeTaxonomies() {
    try {
      if (!this.businessData.accomodationType) return;
      const accommodationTypeTaxonomies = [];
      this.businessData.accomodationType.forEach((item) => {
        if (item.toLowerCase().includes("boat"))
          accommodationTypeTaxonomies.push(54);
        if (item.toLowerCase().includes("cabin"))
          accommodationTypeTaxonomies.push(55);
        if (item.toLowerCase().includes("rental accomodation"))
          accommodationTypeTaxonomies.push(58);
        if (item.toLowerCase().includes("rental campervan"))
          accommodationTypeTaxonomies.push(281);
        if (item.toLowerCase().includes("hostel"))
          accommodationTypeTaxonomies.push(56);
        if (item.toLowerCase().includes("hotel"))
          accommodationTypeTaxonomies.push(57);
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

  exportFAQs() {
    if (!this.businessData.faq) return;
    try {
      let repeaterFAQ = this.businessData.faq;
      if (repeaterFAQ.length) {
        this.acfExportObject.acf["faq_section"] = repeaterFAQ;
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

    const amenitiesTaxonomies = amenities.map((amenity) =>
      amenitiesMasterList.find(
        (item) => item.name.toLowerCase() === amenity.toLowerCase()
      )
    );
  }

  getAmenitiesTaxonomyArray(amenities) {
    if (!amenities.length) return null;

    const amenitiesTaxonomies = amenities.map((amenity) =>
      amenitiesMasterList.find(
        (item) => item.name.toLowerCase() === amenity.toLowerCase()
      )
    );

    return amenitiesTaxonomies
      .filter((item) => item && item.id)
      .map((item) => item.id.toString());
  }

  exportImagesToGallery() {
    let images = this.businessData.scrapedImages;
    if (images.length) {
      //For now, just store names:
      this.acfExportObject.acf["image_gallery"] = images.map((image) => ({
        image_gallery_listing: image,
      }));
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

      //If operation has been cancelled, no need to proceed
      if (operation.status === "cancelled") {
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
      const exportedYeeewLink = `https://yeewdev3.wpengine.com/wp-admin/post.php?post=${this.createdPostID}&action=edit`;
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
