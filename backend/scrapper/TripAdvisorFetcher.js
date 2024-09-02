import axios from "axios";
class TripAdvisorFetcher {
  constructor(businessName) {
    this.businessName = businessName;
    this.entityId = "";
    this.reviews = [];
    this.totalReviews = 0;
    this.rating = 0;
  }

  async init() {
    await this.getBusinessId(this.businessName);
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
      if (data.data.length) {
        this.entityId = data.data[0].contentId;
        if (this.entityId) await this.fetchResortDetails();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async fetchReviews() {
    const options = {
      method: "GET",
      url: "https://tripadvisor-com1.p.rapidapi.com/hotels/reviews",
      params: { contentId: this.entityId },
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "tripadvisor-com1.p.rapidapi.com",
      },
    };
    try {
      const { data } = await axios.request(options);

      if (data.data.reviews && data.data.reviews.length) {
        this.totalReviews =
          data.data.meta && data.data.meta.totalRecords
            ? data.data.meta.totalRecords
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
        this.reviews = data.data.reviews.map((review) => ({
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
      }
    } catch (error) {
      console.error(error);
    }
  }

  async fetchResortDetails() {
    await this.fetchReviews();
  }
}
export default TripAdvisorFetcher;
