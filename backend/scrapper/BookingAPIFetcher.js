import axios from "axios";
class BookingAPIFetcher {
  constructor(businessName) {
    this.businessName = businessName;
    this.dest_id = "";
    this.hotelOverview = null;
    this.description = null;
    this.paymentFeatures = null;
    this.popularLandmarks = null;
  }

  async init() {
    await this.getBusinessId(this.businessName);
    return {
      id: this.dest_id,
      data: JSON.stringify({
        hotelOverview: this.hotelOverview,
        description: this.description,
        paymentFeatures: this.paymentFeatures,
        popularLandmarks: this.popularLandmarks,
      }),
    };
  }

  async getBusinessId(businessName) {
    const options = {
      method: "GET",
      url: "https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination",
      params: { query: businessName },
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_BOOKING_COM_15_KEY,
        "x-rapidapi-host": "booking-com15.p.rapidapi.com",
      },
    };

    try {
      const { data } = await axios.request(options);
      console.log(data);
      if (data.data.length) {
        this.hotelOverview = data.data[0];
        this.dest_id = data.data[0].dest_id;
        await this.fetchResortDetails();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async fetchResortDescription() {
    const options = {
      method: "GET",
      url: "https://booking-com15.p.rapidapi.com/api/v1/hotels/getDescriptionAndInfo",
      params: { hotel_id: this.dest_id, languagecode: "en-us" },
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_BOOKING_COM_15_KEY,
        "x-rapidapi-host": "booking-com15.p.rapidapi.com",
      },
    };
    try {
      const { data } = await axios.request(options);
      console.log(data);

      this.description = data;
    } catch (error) {
      console.error(error);
    }
  }

  async fetchResortPaymentFeatures() {
    const options = {
      method: "GET",
      url: "https://booking-com15.p.rapidapi.com/api/v1/hotels/getPaymentFeatures",
      params: { hotel_id: this.dest_id, languagecode: "en-us" },
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_BOOKING_COM_15_KEY,
        "x-rapidapi-host": "booking-com15.p.rapidapi.com",
      },
    };
    try {
      const { data } = await axios.request(options);
      console.log(data);
      this.paymentFeatures = data;
    } catch (error) {
      console.error(error);
    }
  }

  async fetchResortPopularLandmarks() {
    const options = {
      method: "GET",
      url: "https://booking-com15.p.rapidapi.com/api/v1/hotels/getPopularAttractionNearBy",
      params: { hotel_id: this.dest_id, languagecode: "en-us" },
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_BOOKING_COM_15_KEY,
        "x-rapidapi-host": "booking-com15.p.rapidapi.com",
      },
    };
    try {
      const { data } = await axios.request(options);
      console.log(data);
      this.popularLandmarks = data;
    } catch (error) {
      console.error(error);
    }
  }

  async fetchResortDetails() {
    await this.fetchResortDescription();
    await this.fetchResortPaymentFeatures();
    await this.fetchResortPopularLandmarks();
  }
}
export default BookingAPIFetcher;
