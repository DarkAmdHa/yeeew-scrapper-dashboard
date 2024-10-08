import axios from "axios";
import { logToConsole } from "../utils/functions.js";
class TripAdvisorFetcher {
  constructor(businessName, entityId) {
    this.businessName = businessName;
    this.entityId = entityId ? entityId : "";
    this.reviews = [];
    this.totalReviews = 0;
    this.rating = 0;
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
      if (data.data.length && data.data[0].geoId) {
        this.entityId = data.data[0].geoId;
        if (this.entityId) await this.fetchResortDetails();
      }
    } catch (error) {
      logToConsole(error);
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
          (review) => review.__typename == "AppPresentation_ReviewCard"
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
      logToConsole(error);
    }
  }

  async fetchResortDetails() {
    await this.fetchReviews();
  }
}
export default TripAdvisorFetcher;
