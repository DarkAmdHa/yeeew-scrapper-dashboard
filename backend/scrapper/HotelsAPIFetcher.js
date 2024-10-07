// const axios = require("axios");
import axios from "axios";
import { logToConsole } from "../utils/functions.js";

class HotelsAPIFetcher {
  constructor(businessName) {
    this.businessName = businessName;
    this.entityId = "";
    this.coordinates = {
      lat: "",
      long: "",
    };
    this.description = null;
  }

  async init() {
    await this.getBusinessId(this.businessName);
    console.log(this.description);
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
      url: "https://hotels-com-provider.p.rapidapi.com/v2/regions",
      params: {
        query: businessName,
        domain: "AU",
        locale: "en_AU",
      },
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "hotels-com-provider.p.rapidapi.com",
      },
    };

    try {
      const { data } = await axios.request(options);
      console.log(data);
      if (data.data.length) {
        const findRelevantHotel = data.data.find((item) => item.hotelId);
        if (findRelevantHotel) {
          this.entityId = findRelevantHotel.hotelId;
          if (
            findRelevantHotel.coordinates &&
            findRelevantHotel.coordinates.lat &&
            findRelevantHotel.coordinates.long
          ) {
            this.coordinates.lat = findRelevantHotel.coordinates.lat;
            this.coordinates.long = findRelevantHotel.coordinates.long;
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
      url: "https://hotels-com-provider.p.rapidapi.com/v2/hotels/details",
      params: { hotel_id: this.entityId, domain: "AU", locale: "en_AU" },
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "hotels-com-provider.p.rapidapi.com",
      },
    };
    try {
      const { data } = await axios.request(options);

      const summary = data.summary;
        const newData = {
          summary: {
            tagLine: summary.tagline,
            policies: summary.policies && {
              checkinInstructions: summary.policies.checkinInstructions,
              needToKnow:
                summary.policies.needToKnow && summary.policies.needToKnow.body,
              childAndBed:
                summary.policies.childAndBed && summary.policies.childAndBed.body,
              paymentOptions:
                summary.policies.paymentOptions &&
                summary.policies.paymentOptions.body,
              pets: summary.policies.pets && summary.policies.pets.body,
              shouldMention:
                summary.policies.shouldMention &&
                summary.policies.shouldMention.body,
            },
            highlights: {
              amenities:
                summary.amenities.amenities &&
                summary.amenities.amenities
                  .flatMap((amen) =>
                    amen.contents.flatMap((item) =>
                      item.items.map((it) => it.text)
                    )
                  )
                  .filter(Boolean),
              topAmenities:
                summary.amenities.topAmenities &&
                summary.amenities.topAmenities.items &&
                summary.amenities.topAmenities.items.length &&
                summary.amenities.topAmenities.items.map((item) => item.text),
              highlight:
                summary.amenities.takeover &&
                summary.amenities.takeover.highlight &&
                summary.amenities.takeover.highlight.length &&
                summary.amenities.takeover.highlight
                  .flatMap((high) => high.items.map((item) => item.text))
                  .filter(Boolean),
              property:
                summary.amenities.takeover &&
                summary.amenities.takeover.property &&
                summary.amenities.takeover.property.length &&
                summary.amenities.takeover.property
                  .flatMap((prop) => prop.items.map((item) => item.text))
                  .filter(Boolean),
            },
            location: {
              whatsAround:
                summary.location.whatsAround &&
                summary.location.whatsAround.editorial &&
                summary.location.whatsAround.editorial.content &&
                summary.location.whatsAround.editorial.content.map(
                  (item) => item
                ),
              mapImage:
                summary.location.staticImage && summary.location.staticImage.url,
            },
            nearbyPOIs:
              summary.nearbyPOIs &&
              summary.nearbyPOIs.items &&
              summary.nearbyPOIs.items.map((item) => ({
                text: item.text,
                moreInfo: item.moreInfo,
              })),
          },
          reviewInfo:
            data.reviewInfo.summary &&
            data.reviewInfo.summary.overallScoreWithDescriptionA11y &&
            data.reviewInfo.summary.overallScoreWithDescriptionA11y.value,
          propertyGallery:
            data.propertyGallery &&
            data.propertyGallery.images &&
            data.propertyGallery.images
              .map((image) => {
                if (image.image) {
                  try {
                    const resizedImage = new URL(image.image.url);
                    resizedImage.searchParams.set("rw", 2000);
                    return {
                      imageDescription: image.image.description,
                      url: resizedImage.href,
                    };
                  } catch (error) {
                    console.error(error);
                    return false;
                  }
                } else {
                  return false;
                }
              })
              .filter(Boolean),
          propertyContentSectionGroups: data.propertyContentSectionGroups && {
            aboutThisProperty:
              data.propertyContentSectionGroups.aboutThisProperty &&
              data.propertyContentSectionGroups.aboutThisProperty.sections &&
              data.propertyContentSectionGroups.aboutThisProperty.sections
                .flatMap((section) =>
                  section.bodySubSections.flatMap((subsection) =>
                    subsection.elements.flatMap((el) =>
                      el.items.map((it) => it.content && it.content.text)
                    )
                  )
                )
                .filter(Boolean),
            aboutThisProperty:
              data.propertyContentSectionGroups.policies &&
              data.propertyContentSectionGroups.policies.sections &&
              data.propertyContentSectionGroups.policies.sections
                .flatMap((section) =>
                  section.bodySubSections.flatMap((subsection) =>
                    subsection.elements.flatMap((element) =>
                      element.items.map(
                        (item) => item.content && item.content.text
                      )
                    )
                  )
                )
                .filter(Boolean),
          },
        };
      this.description = newData;
    } catch (error) {
      logToConsole(error);
    }
  }

  async fetchResortDetails() {
    await this.fetchResortDescription();
  }
}
export default HotelsAPIFetcher;
