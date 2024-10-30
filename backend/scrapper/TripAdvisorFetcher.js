import axios from "axios";
import { findTypeName, logToConsole } from "../utils/functions.js";
import pt from "puppeteer";

class TripAdvisorFetcher {
  constructor(businessName, entityId) {
    this.businessName = businessName;
    this.entityId = entityId ? entityId : "";
    this.reviews = [];
    this.totalReviews = 0;
    this.rating = 0;
    this.offers = [];

    this.maxIteration = 5;
    this.currentIteration = 0;
    this.webUrl = "";
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
          reviews: this.reviews,
          totalReviews: this.totalReviews,
          rating: this.rating,
          offers: this.offers,
          webUrl: this.webUrl,
        },
      };
  }

  async getBusinessId(businessName) {
    const options = {
      method: "GET",
      url: "https://tripadvisor-com1.p.rapidapi.com/auto-complete",
      params: { query: businessName },
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "tripadvisor-com1.p.rapidapi.com",
      },
    };

    try {
      const { data } = await axios.request(options);
      if (data.data.length) {
        this.entityId = data.data[0].geoId;
        if (this.entityId) await this.fetchResortDetails();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async fetchReviewsFn() {
    let finalData = {};
    const reviews = [];
    let keepFetching = true;
    let page = 1;
    let updateToken;

    while (keepFetching) {
      const params = {
        contentId: this.entityId,
      };
      if (page != 1) params.page = page;
      if (updateToken) params.updateToken = updateToken;

      const options = {
        method: "GET",
        url: "https://tripadvisor-com1.p.rapidapi.com/hotels/reviews",
        params,
        headers: {
          "x-rapidapi-key": process.env.RAPID_API_KEY,
          "x-rapidapi-host": "tripadvisor-com1.p.rapidapi.com",
        },
      };

      const { data } = await axios.request(options);

      reviews.push(...data.data.reviews);
      if (
        data.meta.currentPage == data.meta.totalPage ||
        reviews.length >= 60
      ) {
        data.data.reviews = reviews.filter(
          (review) =>
            review.__typename != "AppPresentation_GAIReviewsSummaryCard"
        );
        finalData = data;
        keepFetching = false;
      } else {
        page = data.meta.currentPage + 1;
        updateToken = data.meta.updateToken;
      }
    }

    return finalData;
  }

  async fetchDetails(numberOfDaysToAdd = 3) {
    const now = new Date();

    const params = {
      contentId: this.entityId,
      checkIn: new Date(now.setDate(now.getDate() + numberOfDaysToAdd))
        .toISOString()
        .split("T")[0],
      checkOut: new Date(now.setDate(now.getDate() + numberOfDaysToAdd + 1))
        .toISOString()
        .split("T")[0],
    };
    const options = {
      method: "GET",
      url: "https://tripadvisor-com1.p.rapidapi.com/hotels/details",
      params,
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "tripadvisor-com1.p.rapidapi.com",
      },
    };

    const { data } = await axios.request(options);
    let webUrl = "";
    if (
      data.data &&
      data.data.container &&
      data.data.container.shareInfo &&
      data.data.container.shareInfo.webUrl
    )
      webUrl = data.data.container.shareInfo.webUrl;
    this.webUrl = webUrl;
  }

  async fetchReviews() {
    try {
      const data = await this.fetchReviewsFn();
      const randomCount = Math.floor(Math.random() * 10) + 50;

      if (data.data.reviews && data.data.reviews.length) {
        this.totalReviews =
          data.meta && data.meta.totalRecords
            ? data.meta.totalRecords
            : data.data.reviews.length;

        const reviewHeading =
          data.data.sections &&
          data.data.sections.find(
            (section) =>
              section.__typename == "AppPresentation_ReviewListHeaderV2"
          );

        if (reviewHeading) {
          this.rating =
            reviewHeading.reviewsDetailsV2 &&
            reviewHeading.reviewsDetailsV2.rating;
        }
        this.reviews = data.data.reviews.map((review, index) => ({
          reviewRating: review.reviewRating ?? "",
          disclaimer: (review.disclaimer && review.disclaimer.string) ?? "",
          reviewText: (review.htmlText && review.htmlText.htmlString) ?? "",
          reviewTitle: (review.htmlTitle && review.htmlTitle.htmlString) ?? "",
          publishedDate:
            (review.publishedDate && review.publishedDate.string) ?? "",
          userProfile: {
            displayName:
              (review.userProfile && review.userProfile.displayName) ?? "",
            contributionCount:
              (review.userProfile &&
                review.userProfile.contributionCount &&
                review.userProfile.contributionCount.string) ??
              "",
            photos:
              (review.photos &&
                review.photos.map((photo) => ({
                  link:
                    (photo.link && photo.link.route && photo.link.route.url) ??
                    "",
                  photo:
                    (photo.photo &&
                      photo.photo.photoSizes &&
                      photo.photo.photoSizes.length &&
                      photo.photo.photoSizes[photo.photo.photoSizes.length - 1]
                        .url) ??
                    "",
                }))) ??
              [],
            avatar:
              (review.userProfile.avatar &&
                review.userProfile.avatar.data &&
                review.userProfile.avatar.data.sizes &&
                review.userProfile.avatar.data.sizes.length &&
                review.userProfile.avatar.data.sizes[0].url) ??
              "",
            profileLink:
              (review.userProfile.profileLink &&
                review.userProfile.profileLink.route &&
                review.userProfile.profileLink.route.url) ??
              "",
          },
        }));

        this.reviews = this.reviews.slice(0, randomCount);
      }
    } catch (error) {
      console.error(error);
    }
  }
  async fetchOffers(numberOfDaysToAdd = 3) {
    //For tripadvisor, it takes a little bit of time to get the data after the inital request
    const now = new Date();
    try {
      const options = {
        method: "GET",
        url: "https://tripadvisor-com1.p.rapidapi.com/hotels/offers",
        params: {
          checkIn: new Date(now.setDate(now.getDate() + numberOfDaysToAdd))
            .toISOString()
            .split("T")[0],
          checkOut: new Date(now.setDate(now.getDate() + 1))
            .toISOString()
            .split("T")[0],
          currency: "AUD",
          contentId: this.entityId,
        },
        headers: {
          "x-rapidapi-key": process.env.RAPID_API_KEY,
          "x-rapidapi-host": "tripadvisor-com1.p.rapidapi.com",
        },
      };

      const { data } = await axios.request(options);
      const offersList = findTypeName(
        data,
        "AppPresentation_HotelCommerceOfferList"
      );
      if (offersList && offersList.isComplete) {
        const parsedOffers = offersList.offersV2.map((offer) => {
          return {
            providerName: offer.providerName,
            displayPrice: offer.displayPrice
              ? offer.displayPrice.string
              : "N/A",
            details: offer.details.map((detail) => detail.string),
            status: offer.status,
            commerceLink: offer.commerceLink
              ? offer.commerceLink.externalUrl
              : "N/A",
          };
        });
        this.offers = parsedOffers;

        //Parse links and get main listing url:
        this.getListingURL(parsedOffers);
      } else if (
        offersList &&
        !offersList.isComplete &&
        this.currentIteration < this.maxIteration
      ) {
        this.currentIteration += 1;
        //The offers are not yet available, so await 10 seconds and try again:
        await new Promise((resolve, reject) => setTimeout(resolve, 10000));
        await this.fetchOffers();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async getListingURL() {
    try {
      const browser = await pt.launch();
      const page = await browser.newPage();
      await page.setViewport({ width: 1000, height: 500 });

      try {
        await page.goto(link, {
          waitUntil: "networkidle2",
          timeout: args && args.timeout ? args.timeout : 30000,
        });
      } catch (error) {
        console.log(error);

        const bodyContent = await page.evaluate(() =>
          document.body.innerText.trim()
        );

        if (bodyContent.length === 0) {
          await browser.close();
          throw error;
        }
      }
    } catch (error) {}
  }

  async fetchResortDetails() {
    await this.fetchReviews();
    await this.fetchDetails();
    await this.fetchOffers();
  }
}

export default TripAdvisorFetcher;
