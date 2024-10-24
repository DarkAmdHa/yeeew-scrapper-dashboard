import axios from "axios";
import { findTypeName, logToConsole } from "../utils/functions.js";

class HotelsAPIFetcher {
  constructor(businessName, entityId) {
    this.businessName = businessName;
    this.entityId = entityId ? entityId : "";
    this.coordinates = {
      lat: "",
      long: "",
    };
    this.description = null;
    this.rooms = [];
    this.minimumPrice = 0;

    this.maxIterationOfOffers = 3;
    this.offersIterationCount = 0;
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
          rooms: this.rooms,
          minimumPrice: this.minimumPrice,
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

  async fetchResortOffers(numberOfDaysToAdd = 3) {
    const now = new Date();
    const options = {
      method: "GET",
      url: "https://hotels-com-provider.p.rapidapi.com/v2/hotels/offers",
      params: {
        hotel_id: this.entityId,
        domain: "AU",
        locale: "en_AU",
        adults_number: "1",
        checkin_date: new Date(now.setDate(now.getDate() + numberOfDaysToAdd))
          .toISOString()
          .split("T")[0],
        checkout_date: new Date(
          now.setDate(now.getDate() + numberOfDaysToAdd + 1)
        )
          .toISOString()
          .split("T")[0],
      },
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "hotels-com-provider.p.rapidapi.com",
      },
    };
    try {
      const { data } = await axios.request(options);

      const offerListings = data.categorizedListings;
      let rooms = [],
        minimumPrice;
      if (offerListings) {
        rooms = offerListings.map((listing) => {
          const roomName = listing.header?.text || "";
          const features = listing.features
            ? listing.features.map((feature) => feature.text)
            : [];
          const propertyUnit = findTypeName(listing, "PropertyUnit");
          let description, gallery, ratePlans;
          if (propertyUnit) {
            description = propertyUnit.description || "";
            gallery =
              propertyUnit.unitGallery && propertyUnit.unitGallery.gallery
                ? propertyUnit.unitGallery.gallery.map(
                    (gal) => gal.image?.url || ""
                  )
                : [];
            ratePlans = propertyUnit.ratePlans
              ? propertyUnit.ratePlans.map(
                  (plan) =>
                    plan.priceDetails &&
                    plan.priceDetails[0] && {
                      available:
                        plan.priceDetails[0].availability?.available || false,
                      cancellationPolicy:
                        plan.priceDetails[0].cancellationPolicy?.type || "",
                      price: plan.priceDetails[0].price?.total?.amount || 0,
                      roomNightMessage:
                        plan.priceDetails[0].price?.roomNightMessage || "",
                    }
                )
              : [];
          }

          return {
            roomName,
            features: features,
            description: description ?? "",
            gallery: gallery ?? [],
            ratePlans: ratePlans ?? [],
          };
        });
      }

      function findMinimumPrice(rooms) {
        let minPrice = Infinity;

        rooms.forEach((room) => {
          room.ratePlans.forEach((ratePlan) => {
            if (ratePlan.price < minPrice) {
              minPrice = ratePlan.price;
            }
          });
        });

        return minPrice;
      }

      if (rooms.length) {
        minimumPrice = findMinimumPrice(rooms);

        this.rooms = rooms;
        this.minimumPrice = minimumPrice;
      } else if (this.offersIterationCount < this.maxIterationOfOffers) {
        this.offersIterationCount++;
        await this.fetchResortOffers(numberOfDaysToAdd + 3);
      }
    } catch (error) {
      logToConsole(error);
    }
  }

  async fetchResortDetails() {
    await this.fetchResortDescription();
    await this.fetchResortOffers();
  }
}
export default HotelsAPIFetcher;
