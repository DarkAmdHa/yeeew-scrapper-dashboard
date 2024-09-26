import csvParser from "csv-parser";
import fs from "fs";
import path from "path";
import Fuse from "fuse.js";

import { fileURLToPath } from "url";
class AgodaAPIFetcher {
  constructor(businessName) {
    this.businessName = businessName;
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.filePath = path.resolve(__dirname, "../data", "AgodaDataFile.csv");
  }

  searchCSV() {
    return new Promise((resolve, reject) => {
      let result = null;

      fs.createReadStream(this.filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          const hotel = { hotel_name: row.hotel_name };

          const fuse = new Fuse([hotel], {
            keys: ["hotel_name"],
            threshold: 0.1, // Adjust the matching accuracy (lower is stricter)
          });

          const results = fuse.search(this.businessName);

          if (results.length > 0) {
            const foundRow = {};
            Object.keys(row).forEach((r) => {
              let cleanedKey = r;
              if (r.charCodeAt(0) === 65279) {
                cleanedKey = r.slice(1); // Remove the BOM
              }
              foundRow[cleanedKey] = row[r];
            });
            result = foundRow;
            resolve(result);
          }
        })
        .on("end", () => {
          if (!result) {
            resolve(null);
          }
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  }

  async lookupBusiness(businessName) {
    if (!this.businessName) this.businessName = businessName;
    const foundRow = await this.searchCSV();
    if (!foundRow) {
      console.log("Hotel not found");
      return null;
    }
    console.log("Hotel found in Agoda data");

    return {
      id: foundRow.hotel_id,
      data: {
        hotelName: foundRow.hotel_name ? foundRow.hotel_name : "",
        zipCode: foundRow.zipcode ? foundRow.zipcode : "",
        address: foundRow.addressline1 ? foundRow.addressline1 : "",
        city: foundRow.city ? foundRow.city : "",
        state: foundRow.state ? foundRow.state : "",
        country: foundRow.country ? foundRow.country : "",
        longitude: foundRow.longitude ? foundRow.longitude : "",
        latitude: foundRow.latitude ? foundRow.latitude : "",
        url: foundRow.url ? foundRow.url : "",
        numberOfRooms: foundRow.numberrooms ? foundRow.numberrooms : "",
        overview: foundRow.overview ? foundRow.overview : "",
        numberOfReviews: foundRow.number_of_reviews
          ? foundRow.number_of_reviews
          : "",
        accommodationType: foundRow.accommodation_type
          ? foundRow.accommodation_type
          : "",
      },
    };
  }
}

export default AgodaAPIFetcher;
