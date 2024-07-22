import AWS from "aws-sdk";
import axios from "axios";
import path from "path";
import { writeFile } from "fs/promises";
import { downloadImgToLocal, deleteImgFromLocal } from "./tempStorage.js";
import categorizeImage from "./categorizeImage.js";
import pt from "puppeteer";

import Listing from "../models/listingModel.js";
import Operation from "../models/operationModel.js";
import Prompt from "../models/promptModel.js";
import BookingAPIFetcher from "./BookingAPIFetcher.js";
import PricelineAPIFetcher from "./PricelineAPIFetcher.js";
import HotelsAPIFetcher from "./HotelsAPIFetcher.js";

class Scrapper {
  constructor(businessData, operationId) {
    this.businessData = businessData;
    this.operationId = operationId;
    this.scrapedData = {};
    this.operationStatus = "";
    this.enoughData = false;
  }

  async init() {
    try {
      await this.updateOperationStatus();
      if (this.operationStatus != "cancelled") {
        //Keep going if the operation is not cancelled yet:
        await this.processBusinessData();
        if (this.enoughData) {
          await this.saveScrapedData();
        } else {
          await this.logError(
            "No data about the business could be found, either on it's main site, or on any of the third party platforms. Please make sure the name is correct."
          );
        }
        await this.updateOperation();
        console.log(this.scrapedData);
      }
    } catch (error) {
      console.error("Error processing business data:", error);

      if (error.message) {
        await this.logError("Error processing business data:" + error.message);
      } else {
        await this.logError("Error processing business data:" + error);
      }
    }
  }

  async processBusinessData() {
    this.scrapedData = await this.scrapeBusinessSite(
      this.businessData.businessName,
      this.businessData.businessURL
    );
    this.scrapedData = await this.scrapeDataFromGoogle(
      this.businessData.businessName,
      this.scrapedData
    );
    this.scrapedData = await this.scrapePlatforms(
      this.businessData,
      this.scrapedData
    );
    this.scrapedData = await this.scrapeFromBookingAPI();
    this.scrapedData = await this.scrapeFromPricelineAPI();
    this.scrapedData = await this.scrapeFromHotelsAPI();
    if (this.listingHasEnoughData(this.scrapedData)) {
      //Only proceed if enough data was gathered
      this.scrapedData = await this.generateFinalContent(
        this.businessData,
        this.scrapedData
      );
      this.scrapedData = await this.buildBusinessSlug(
        this.businessData,
        this.scrapedData
      );
      this.scrapedData = await this.locateBusiness(this.scrapedData);
    }
  }

  async saveScrapedData() {
    try {
      const listingId = this.businessData._id;
      const listing = await Listing.findById(listingId);
      if (!listing) {
        throw new Error("Listing not found");
      }

      listing.scraped = true;
      listing.scrapedAt = new Date();
      const scrapedFinalData = this.scrapedData.data;
      this.setupBusinessDocumentUpdate(listing, scrapedFinalData);
      console.log(JSON.stringify(listing));

      await listing.save();
      console.log("Business data saved to the database");
    } catch (error) {
      console.error("Error saving business data:", error);
      if (error.message) {
        await this.logError("Error saving business data:" + error.message);
      } else {
        await this.logError("Error saving business data:" + error);
      }
    }
  }

  async scrapeFromBookingAPI() {
    try {
      // Usage example:
      const resortFetcher = new BookingAPIFetcher(
        this.businessData.businessName
      );
      const apiResponse = await resortFetcher.init();
      console.log(apiResponse);

      if (this.scrapedData.data.apiData) {
        this.scrapedData.data.apiData.booking = apiResponse;
      } else {
        this.scrapedData.data.apiData = {
          booking: apiResponse,
        };
      }
    } catch (error) {
      console.log("Error encountered while fetching from API:", error);
      this.logError("Error encountered while fetching from API");
    }

    return this.scrapedData;
  }
  async scrapeFromPricelineAPI() {
    try {
      // Usage example:
      const resortFetcher = new PricelineAPIFetcher(
        this.businessData.businessName
      );
      const apiResponse = await resortFetcher.init();

      if (this.scrapedData.data.apiData) {
        this.scrapedData.data.apiData.priceline = apiResponse;
      } else {
        this.scrapedData.data.apiData = {
          priceline: apiResponse,
        };
      }
    } catch (error) {
      console.log("Error encountered while fetching from API:", error);
      this.logError("Error encountered while fetching from API");
    }

    return this.scrapedData;
  }

  async scrapeFromHotelsAPI() {
    try {
      // Usage example:
      const resortFetcher = new HotelsAPIFetcher(
        this.businessData.businessName
      );
      const apiResponse = await resortFetcher.init();

      if (this.scrapedData.data.apiData) {
        this.scrapedData.data.apiData.hotels = apiResponse;
      } else {
        this.scrapedData.data.apiData = {
          hotels: apiResponse,
        };
      }
    } catch (error) {
      console.log("Error encountered while fetching from API:", error);
      this.logError("Error encountered while fetching from API");
    }

    return this.scrapedData;
  }

  setupBusinessDocumentUpdate(listing, data) {
    listing.email = data.contact_email || "";
    listing.phoneNumber = data.phone_number || "";
    listing.whatsappNumber = data.whatsapp_number || "";
    listing.contactName = data.contact_name || "";
    listing.address = data.location
      ? data.googleAddress
      : data.location
      ? data.location
      : "";
    listing.summary = data.summary || "";
    listing.customSlug = data.slug || "";

    if (data.googleLatitude && data.googleLongitude) {
      listing.longitude = data.googleLongitude;
      listing.latitude = data.googleLatitude;
    } else if (data.coordinates) {
      listing.longitude = data.coordinates.lng || "";
      listing.latitude = data.coordinates.lat || "";
    }

    //Accomodation Types As array:
    if (data.accomodation_type) {
      listing.accommodationType = data.accomodation_type.split(",");
    }
    if (data.trip_type) {
      listing.tripType = data.trip_type.split(",");
    }

    listing.apiData = {};
    if (data.apiData && data.apiData.booking) {
      listing.apiData.booking = data.apiData.booking;
    }
    if (data.apiData && data.apiData.priceline) {
      listing.apiData.priceline = data.apiData.priceline;
    }
    if (data.apiData && data.apiData.hotels) {
      listing.apiData.hotels = data.apiData.hotels;
    }
    console.log(JSON.stringify(this.scrapedData));

    if (data.platformSummaries && data.platformSummaries["bookingData"]) {
      const bookingData = data.platformSummaries.bookingData;
      listing.roomsFromBooking = bookingData.rooms;
      listing.propertyAmenitiesFromBooking = bookingData.amenities;
      listing.propertySurroundingsFromBooking = bookingData.surroundings;
    }

    //Content Save:
    if (data.content) {
      listing.overview = data.content.overview || "";
      listing.aboutAccomodation = data.content.aboutAccomodation || "";
      listing.foodInclusions = data.content.foodInclusions || "";
      listing.specificSurfSpots = data.content.specificSurfSpots || "";
      listing.gettingThere = data.content.gettingThere || "";
      listing.faq = data.content.faq || [];

      if (data.content.highlights) {
        listing.highlightsAndTopAmenities = data.content.highlights.split(";");
      }
    }

    if (data.platformSummaries) {
      let scrapedImagesArray = [];
      var dataToProcess = [
        {
          data: data.platformSummaries["bookingData"],
          name: "booking",
        },
        {
          data: data.platformSummaries["tripData"],
          name: "trip",
        },
        {
          data: data.platformSummaries["expediaData"],
          name: "expedia",
        },
        {
          data: data.platformSummaries["agodaData"],
          name: "agoda",
        },
        {
          data: data.platformSummaries["trivagoData"],
          name: "trivago",
        },
        {
          data: data.platformSummaries["perfectWaveData"],
          name: "perfectWave",
        },
        {
          data: data.platformSummaries["luexData"],
          name: "luex",
        },
        {
          data: data.platformSummaries["waterWaysTravelData"],
          name: "waterways",
        },
        {
          data: data.platformSummaries["worldSurfarisData"],
          name: "worldSurfaris",
        },
        {
          data: data.platformSummaries["awaveData"],
          name: "awave",
        },
        {
          data: data.platformSummaries["atollTravelData"],
          name: "atollTravel",
        },
        {
          data: data.platformSummaries["surfHolidaysData"],
          name: "surfHolidays",
        },
        {
          data: data.platformSummaries["surflineData"],
          name: "surfline",
        },
        {
          data: data.platformSummaries["lushPalmData"],
          name: "lushPalm",
        },
        {
          data: data.platformSummaries["thermalTravelData"],
          name: "thermal",
        },
        {
          data: data.platformSummaries["bookSurfCampsData"],
          name: "bookSurfCamps",
        },
        {
          data: data.platformSummaries["nomadSurfersData"],
          name: "nomadSurfers",
        },
        {
          data: data.platformSummaries["stokedSurfAdventuresData"],
          name: "stokedSurfAdventures",
        },
        {
          data: data.platformSummaries["soulSurfTravelData"],
          name: "soulSurfTravel",
        },
        {
          data: data.platformSummaries["surfersHypeData"],
          name: "surfersHype",
        },
      ];

      //Images from main site:
      if (data.imagesFromMain) {
        scrapedImagesArray.push(...data.imagesFromMain);
      }

      // Loop through the array and process the data
      dataToProcess.forEach(function (item) {
        if (item.data) {
          listing[item.name] = {
            highlights: item.data.highlights ? item.data.highlights : "",
            summary: item.data.textContent ? item.data.textContent : "",
            link: item.data.link ? item.data.link : "",
          };
          if (item.data.images) {
            scrapedImagesArray.push(...item.data.images);
          }
        }
      });

      console.log(scrapedImagesArray);
      listing.scrapedImages = scrapedImagesArray;
      return listing;
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
      console.log("Operation Status Updated");
    } catch (error) {
      console.error("Error updating operation:", error);
      if (error.message) {
        await this.logError("Error updating operation:" + error.message);
      } else {
        await this.logError("Error updating operation:" + error);
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

      console.log("Operation updated with processed listing ID");
    } catch (error) {
      console.error("Error updating operation:", error);

      if (error.message) {
        await this.logError("Error updating operation:" + error.message);
      } else {
        await this.logError("Error updating operation:" + error);
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
      console.log(operation);
      await operation.save();
      console.log("Error logged to the database");
    } catch (saveError) {
      console.error("Error logging error:", saveError);
    }
  }

  async sanitizeHTML(html) {
    try {
      // Regular expression to extract hrefs from <a> tags
      const hrefRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/gim;
      let hrefs = [];
      let match;
      while ((match = hrefRegex.exec(html)) !== null) {
        hrefs.push(match[1]);
      }

      // Create a string of hrefs separated by new lines
      const hrefsString = hrefs.join("\n") + "\n\n";

      // Regular expressions to remove various non-textual elements
      var cleanedContent = html
        .replace(/<script[^>]*>([\S\s]*?)<\/script>/gim, "")
        .replace(/<style[^>]*>([\S\s]*?)<\/style>/gim, "")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<head[^>]*>[\s\S]*?<\/head>/gim, "")
        //    .replace(/<[^>]*>/g, '')
        .replace(/<(?!\/?a\s*[^>]*>)[^>]*>/g, "")
        .replace(/(<a [^>]*?)\sclass="[^"]*"(.*?>)/gi, "$1$2")
        .replace(/(onclick|onload)="[^"]*"/gim, "")
        .replace(/style="[^"]*"/gim, "")
        .replace(/\s+/g, " ")
        .trim();

      // Concatenate hrefs at the top of the cleaned content
      const finalContent = hrefsString + cleanedContent;

      return finalContent;
    } catch (e) {
      console.log(`Issue with URL ${url}: ${e.message}`.red);
      await this.logError(`Issue with URL ${url}: ${e.message}`);
    }
  }

  regularFetch = async (link) => {
    let response;
    try {
      // const scraperAPIUrl = "https://api.scraperapi.com/?api_key=fe563d2e2531c760d454cbc530b12f96&url=" + encodeURIComponent(link);
      const scraperAPIUrl = link;
      response = await fetch(scraperAPIUrl);

      let htmlContent = await response.text();

      return await this.sanitizeHTML(htmlContent);
    } catch (e) {
      console.log(`Issue with URL ${link}: ${e.message}`.red);

      await this.logError(`Issue with URL ${link}: ${e.message}`);
    }
  };

  async twoWayComm(link, prompts) {
    const maxIterations = +process.env.MAX_CRAWL_ITERATIONS || 6;
    const imagesFromMain = [];
    let iteration = 1;
    const visitedLinks = [];

    let response = await this.siteInfoScrapper(link, prompts, undefined, true);

    if (
      response.uploadedImageLocations &&
      response.uploadedImageLocations.length
    )
      imagesFromMain.push(...response.uploadedImageLocations);
    console.log(`Scraped ${link}`.green);
    visitedLinks.push(link);
    while (
      response.parsedJSONResponse.nextLink &&
      response.parsedJSONResponse.nextLink != "" &&
      iteration < maxIterations
    ) {
      iteration++;
      const previousData = {
        previousReturnedData: response.parsedJSONResponse.data,
        visitedLinks,
      };
      console.log(
        `Scraping Next Link: ${response.parsedJSONResponse.nextLink}`.green
      );
      response = await this.siteInfoScrapper(
        response.parsedJSONResponse.nextLink,
        prompts,
        previousData,
        true
      );
      if (
        response.uploadedImageLocations &&
        response.uploadedImageLocations.length
      )
        imagesFromMain.push([...response.uploadedImageLocations]);
      visitedLinks.push(response.parsedJSONResponse.nextLink);
    }

    console.log(
      `Final Data after scraping site: ${JSON.stringify(response)}`.green
    );
    return { mainSiteData: response.parsedJSONResponse.data, imagesFromMain };
  }

  findListingOnGoogle = async (businessName, platform) => {
    const prompt = `Use the following Google.com code to look for ${businessName}'s listing on ${platform}. Make sure you return the actual link if it only partains to the platform ${platform}. There might be ads, or similar looking pages, or even the business' main site, or reviews or other pages but these should all be ignored. We only want the listing of ${businessName} on the ${platform}, not reviews or other pages related to the business.If such a listing is not found in the provided code, return an error in json i.e error: "not found"`;
    const link = `https://www.google.com/search?q=${encodeURIComponent(
      businessName + " site:" + platform
    )}`;
    return await this.communicateWithOpenAi(link, prompt);
  };

  communicateWithOpenAi = async (link, prompt) => {
    const apiKey = process.env.OPEN_AI_API_KEY;
    try {
      const result = await this.puppeteerLoadFetch(link, true);

      const cleanedContent = result.sanitizedData;
      const messages = [
        {
          role: "system",
          // If the data is not found, send back instead the next plausible link where it could be found based on the code provided to you eg /contact or /contact-us (in case the user is looking for contact data). This should also be in JSON as
          // Make sure this next link is working. What i mean is, if the next link points to /contact, make sure the returned link is in the form https://google.com/contact ,in this case, the initial site passed to you is google.com.
          // {nextLink: NEXT LINK HERE}
          content: `You will go through a provided code and look for the requested data.
              If the data is found, return a JSON response with data in 
              {data: FOUND DATA HERE}
              If instead the data is nowhere to be found, write a nice message saying something like "The email could not be found on this site (Or something along those line) in JSON as 
              {error: YOU RESPONSE HERE}
              Only reply in the above fashion.
            `,
        },
        { role: "user", content: prompt + ":\n" + cleanedContent },
      ];

      var data = {
        messages: messages,
        // model: "gpt-4-turbo-preview",
        model: "gpt-4o",
        response_format: { type: "json_object" },
      };

      var response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          Authorization: "Bearer " + apiKey,
          "Content-Type": "application/json",
        },
      });

      const responseInJson = await response.json();
      if (!response.ok) {
        throw new Error(
          responseInJson.error
            ? responseInJson.error.code + ": " + responseInJson.error.message
            : "Something went wrong trying to connect with the OpenAI API"
        );
      }
      const parsedResponse = responseInJson["choices"][0]["message"]["content"];
      console.log(`Open AI Response: ${parsedResponse}`.green);
      // Since our responses are also replied as JSON strings
      return JSON.parse(parsedResponse);
    } catch (er) {
      console.log(`${er.message}`.red);
      await this.logError(er.message);
    }
  };

  puppeteerLoadFetch = async (
    link,
    justText = false,
    scrapingImages = false,
    businessSlug,
    dynamic,
    platformName = ""
  ) => {
    const browser = await pt.launch({ headless: true });

    const page = await browser.newPage();

    await page.setViewport({ width: 1000, height: 500 });

    await page.goto(link);

    if (dynamic) {
      // Wait for 5 seconds before scraping:
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
    let sanitizedData;
    let uploadedImageLocations = [];
    if (scrapingImages) {
      //Scrape images from browser:
      const images = await this.scrapeImages(page, platformName);
      if (images.length)
        uploadedImageLocations = await this.saveImagesToS3(
          images,
          businessSlug
        );
    }

    //Trying to get it from ChatGPT as well.
    // try {
    //   if (platformName === "booking") {
    //     //Scrape Room Types:
    //     await page.evaluate(() => {
    //       const rooms = [];
    //       if (document.querySelectorAll("#rooms_table [data-room-name]").length) {
    //         document
    //           .querySelectorAll("#rooms_table [data-room-name]")
    //           .forEach((room) => {
    //             const row = room.closest("tr");
    //             const facilities = [];
    //             row
    //               .querySelectorAll(".hprt-facilities-facility")
    //               .forEach((facility) => facilities.push(facility.innerText));
    //             const maxOccupancy = row.querySelector(
    //               ".hprt-table-cell-occupancy .bui-u-sr-only"
    //             )?.innerText;
    //             rooms.push({
    //               roomName: room.innerText,
    //               roomFacilities: facilities,
    //               maxOccupancy: maxOccupancy,
    //               priceWhenScraped: row.querySelector(".bui-price-display__value")
    //                 ?.innerText,
    //             });
    //           });
    //       }
    //     });
    //   }
    // } catch (error) {
    //   console.log("Ran into an error scrapping Booking room types".red);
    // }

    if (justText) {
      await page.evaluate(() => {
        document.querySelectorAll("a").forEach((a) => {
          a.outerHTML = "Link: " + a.href + " " + a.innerText + " ";
        });
      });
      sanitizedData = await page.evaluate(() => {
        return document.querySelector("body").innerText;
      });
    } else {
      const HTML = await page.content();
      sanitizedData = await this.sanitizeHTML(HTML);
    }

    await browser.close();
    return { uploadedImageLocations, sanitizedData };
  };

  scrapeImagesFromBooking = async (page) => {
    const bookingImages = await page.evaluate(() => {
      const imagesArr = [];
      document.querySelector(".bh-photo-grid img").click();
      document
        .querySelectorAll(".bh-photo-modal .bh-photo-modal-grid-item-wrapper")
        .forEach((a, index) => {
          a.click();
          const activeImg = document.querySelector(
            ".bh-photo-modal-image-element img"
          ).src;
          //Max 15 images:
          if (index < 15) imagesArr.push(activeImg);
        });

      return imagesArr;
    });
    return bookingImages;
  };

  async scrapeImages(page, customPlatform = "") {
    //This function will be run while the browser is open in order
    //to scrape images that are above a certain threshold
    let images;
    if (customPlatform === "booking") {
      images = await this.scrapeImagesFromBooking(page);
    } else {
      images = await page.evaluate(() => {
        const imagesArray = [];
        document.querySelectorAll("img").forEach((image, index) => {
          if (image.naturalWidth >= 800 && index <= 20) {
            // Check image sizer
            imagesArray.push(image.src);
          }
        });
        return imagesArray;
      });
    }
    return images;
  }

  saveImagesToS3 = async (images, businessSlug) => {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const bucketName = process.env.S3_BUCKET_NAME;
    const folderName = businessSlug; // Change this to your desired folder name

    const uploadedImageLocations = [];

    // Loop through each image URL
    for (const imageUrl of images) {
      try {
        // Remove query parameters from URL
        const cleanImageUrl = imageUrl.split("?")[0];

        // Download the image from the URL
        const response = await axios.get(imageUrl, {
          responseType: "arraybuffer",
        });
        const imageData = Buffer.from(response.data, "binary");

        // Extract the file extension from the URL
        const fileExtension = path.extname(cleanImageUrl);

        /****Detect Image Labels With Cloud Vision API: */
        const tempFilePath = `./temp/file_${new Date().getTime()}${fileExtension}`;
        let imageLabel;

        try {
          // await downloadImgToLocal(imageUrl, tempFilePath);
          //Save file locally for processing, and delete afterwards:
          await writeFile(tempFilePath, imageData);
          imageLabel = await categorizeImage(tempFilePath);
          await deleteImgFromLocal(tempFilePath);
        } catch (error) {
          console.error("Error:", error);
          await this.logError("Error:", error);
        }

        // Set the S3 parameters
        const params = {
          Bucket: bucketName,
          Key: `${folderName}/${imageLabel}/${Date.now()}_image${fileExtension}`, // Use a unique key for the image file
          Body: imageData,
        };

        // Upload the image file to S3
        const uploadResult = await s3.upload(params).promise();
        console.log(
          `File uploaded successfully. Location:${uploadResult.Location}`.green
        );
        uploadedImageLocations.push(uploadResult.Location); // Add the upload location to the array
      } catch (error) {
        console.error(`Error uploading file:${error}`.red);
        await this.logError(`Error uploading file:${error}`.red);
      }
    }

    return uploadedImageLocations; // Return the array of uploaded image locations
  };

  generateSEOContentWithGoogle = async (
    data,
    prompt,
    returnAsJson = false,
    businessName
  ) => {
    //Get relevant google data:
    let googleUrl;
    if (businessName) {
      googleUrl = `https://www.google.com/search?q=${encodeURIComponent(
        businessName + " " + "site:yeeew.com"
      )}`;
    } else {
      googleUrl = `https://www.google.com/search?q=${encodeURIComponent(
        data.data.location + " " + "site:yeeew.com"
      )}`;
    }
    const links = await this.fetchRelevantGoogleLinks(googleUrl, 4);

    //Fetch each link:
    const relevantLinks = [];
    for (let i = 0; i < links.length; i++) {
      // const linkData = await regularFetch(links[i]);
      try {
        const result = await this.puppeteerLoadFetch(links[i], true);
        const linkData = result.sanitizedData;
        relevantLinks.push({
          link: links[i],
          linkHTML: linkData,
        });
      } catch (error) {
        console.log(`Error while accessing ${links[i]} : ${error}`);
        await this.logError(`Error while accessing ${links[i]} : ${error}`);
      }
    }

    //This prompt needs to be filled with data:
    let prompt2 = prompt;
    prompt2 = prompt2.replace("{{ businessData }}", JSON.stringify(data));
    prompt2 = prompt2.replace(
      "{{ relevantLinks }}",
      JSON.stringify(relevantLinks)
    );

    const content = await this.regularOpenAi("", prompt2, returnAsJson);
    return content;
  };

  regularOpenAi = async (link, prompt, returnAsJson = false) => {
    const apiKey = process.env.OPEN_AI_API_KEY;
    let cleanedContent;
    try {
      if (link != "") cleanedContent = await this.regularFetch(link);
      const messages = [
        {
          role: "system",
          content: `
            You will generate SEO rich content describing different business' based on the provided data about them. 
            Reference surfing spots as surf spots and make it sound exciting! write this in the style of William Finnegan's writing
            You will Write it in the third person. Make sure your writing is factual. Write a description of the accommodation.
             You will also be provided with a list of the user's existing site page links, based on which, where possible you will try to link your written content to other relevant existing pages of the user's site.
             Make sure the connections are natural, based on things like other surf spots in the area, similar accomodations etc.
            `,
        },
        { role: "user", content: prompt },
      ];
      if (cleanedContent) {
        messages.push({
          role: "user",
          content: "Here's our existing site pages:" + cleanedContent,
        });
      }
      var data = {
        messages: messages,
        // model: "gpt-4-turbo-preview",
        model: "gpt-4o",
      };

      if (returnAsJson) data["response_format"] = { type: "json_object" };

      var response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          Authorization: "Bearer " + apiKey,
          "Content-Type": "application/json",
        },
      });

      const responseInJson = await response.json();
      if (!response.ok) {
        throw new Error(
          responseInJson.error
            ? responseInJson.error.code + ": " + responseInJson.error.message
            : "Something went wrong trying to connect with the OpenAI API"
        );
      }

      const parsedResponse = responseInJson["choices"][0]["message"]["content"];
      console.log(`Open AI Response: ${parsedResponse}`.green);
      // Since our responses are also replied as JSON strings
      return parsedResponse;
    } catch (er) {
      await this.logError(`${er.message}`);
      console.error(er.message + er.stack);
    }
  };

  fetchRelevantGoogleLinks = async (link, max) => {
    const browser = await pt.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 1000, height: 500 });

    await page.goto(link);

    const links = await page.$$eval(
      `a[href^="https://www.yeeew.com/listing"]`,
      (as) => as.map((a) => a.href)
    );
    await browser.close();

    console.log(`Relevant Yeew Links:${links}`.green);

    return links.slice(0, max);
  };

  async listingScrape(
    platformName,
    businessName,
    listingCode,
    prompts,
    prompt = ""
  ) {
    //Get summary from chatgpt of the result:
    let listingPrompt;
    if (prompt != "") listingPrompt = prompt;
    else listingPrompt = prompts.platformDataRetreivalPrompt;

    listingPrompt = listingPrompt.replace("{{ platformName }}", platformName);
    listingPrompt = listingPrompt.replace("{{ businessName }}", businessName);
    listingPrompt = listingPrompt.replace("{{ businessData }}", listingCode);

    const messages = [
      {
        role: "system",
        content: `
          You will go through a provided code and look for the requested data.
          If the data is found, return a JSON response with data in 
          {data: FOUND DATA HERE}
          If instead the data is nowhere to be found, write a nice message saying something like "The email could not be found on this site (Or something along those line) in JSON as 
          {error: YOU RESPONSE HERE}
          Only reply in the above fashion.
        `,
      },
      { role: "user", content: listingPrompt },
    ];

    if (platformName == "Booking.com") {
      messages.push({
        role: "user",
        content: `Given that this is a booking.com listing, we also need the business' room types details as well as it's property surroundings and all amenities.
      The data needs to be returned in a specific way assuming it figures on the page. With regard to these three specific fields, please do not assume anything. Only reflect data that already figures on the page. 
      For the room type, within the data field, return the a 'rooms' key containing an array of objects of the format 
      [
        {
            "roomName":"string",
            "maxOccupancy": "string",
            "priceWhenScraped":"string",
            "roomFacilities": ["string","string"]
        },
        {
            "roomName":"string",
            "maxOccupancy": "string",
            "priceWhenScraped":"string",
            "roomFacilities": ["string","string"]
        },
      ]

      Property surroundings need to be returned as a key called 'surroundings' which will be an array having the format: 
        [
          {
              "surroundingType": "string",
              "surroundings": [
                  {
                      "type": "string",
                      "name": "string",
                      "distance": "string"
                  },
                  {
                      "type": "string",
                      "name": "string",
                      "distance": "string"
                  }
              ]
          },
          {
              "surroundingType": "string",
              "surroundings": [
                  {
                      "type": "string",
                      "name": "string",
                      "distance": "string"
                  },
                  {
                      "type": "string",
                      "name": "string",
                      "distance": "string"
                  }
              ]
          }
      ]

      And the property amenities need to be returned as the key "amenities" which will also be an array of amenities in the format:
      [
        {
            type: "string",
            amenities: ["string", "string"]
        },
        {
            type: "string",
            amenities: ["string", "string"]
        },
      ]
      `,
      });
    }
    const response = await this.openAiWithPrompts(messages);
    return JSON.parse(response);
  }

  openAiWithPrompts = async (messages) => {
    const apiKey = process.env.OPEN_AI_API_KEY;
    try {
      var data = {
        messages: messages,
        // model: "gpt-4-turbo-preview",
        model: "gpt-4o",
        response_format: { type: "json_object" },
      };

      var response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          Authorization: "Bearer " + apiKey,
          "Content-Type": "application/json",
        },
      });

      const responseInJson = await response.json();
      if (!response.ok) {
        throw new Error(
          responseInJson.error
            ? responseInJson.error.code + ": " + responseInJson.error.message
            : "Something went wrong trying to connect with the OpenAI API"
        );
      }

      const parsedResponse = responseInJson["choices"][0]["message"]["content"];
      console.log(`Open AI Response: ${parsedResponse}`.green);
      // Since our responses are also replied as JSON strings
      return parsedResponse;
    } catch (er) {
      console.error(er.message + er.stack);
      await this.logError(`${er.message}`);
    }
  };

  slugBuilder = async (businessName, location, prompt) => {
    const apiKey = process.env.OPEN_AI_API_KEY;

    try {
      const messages = [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: `The business name is ${businessName} and it's based in ${location}`,
        },
      ];
      var data = {
        messages: messages,
        model: "gpt-4o",
      };

      var response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          Authorization: "Bearer " + apiKey,
          "Content-Type": "application/json",
        },
      });

      const responseInJson = await response.json();
      if (!response.ok) {
        throw new Error(
          responseInJson.error
            ? responseInJson.error.code + ": " + responseInJson.error.message
            : "Something went wrong trying to connect with the OpenAI API"
        );
      }

      const parsedResponse = responseInJson["choices"][0]["message"]["content"];
      console.log(`Open AI Response - Slug Builder: ${parsedResponse}`.green);
      // Since our responses are also replied as JSON strings
      return parsedResponse;
    } catch (er) {
      console.error(er.message + er.stack);
      await this.logError(`${er.message}`);
    }
  };

  generateSlug(name) {
    let slug = name.toLowerCase();

    slug = slug.replace(/\s+/g, "-").replace(/[^\w-]/g, "");

    slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    slug = encodeURIComponent(slug);

    return slug;
  }

  siteInfoScrapper = async (
    link,
    prompts,
    previousData,
    scrapeImages = false
  ) => {
    const apiKey = process.env.OPEN_AI_API_KEY;
    try {
      const { sanitizedData, uploadedImageLocations } =
        await this.puppeteerLoadFetch(
          link,
          false,
          scrapeImages,
          this.generateSlug(this.businessData.businessName),
          true,
          ""
        );
      const cleanedContent = await this.regularFetch(link, scrapeImages);
      const messages = [
        {
          role: "system",
          content: prompts.adminPrompt,
        },
        { role: "user", content: prompts.fullScrapperPrompt + sanitizedData },
      ];
      if (previousData) {
        messages.push({
          role: "user",
          content: `Here's a json containing the previous data you sent as well as links you've already visited: ${JSON.stringify(
            previousData
          )}`,
        });
      }

      var data = {
        messages: messages,
        model: "gpt-4o",
        response_format: { type: "json_object" },
      };

      var response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          Authorization: "Bearer " + apiKey,
          "Content-Type": "application/json",
        },
      });

      const responseInJson = await response.json();
      if (!response.ok) {
        throw new Error(
          responseInJson.error
            ? responseInJson.error.code + ": " + responseInJson.error.message
            : "Something went wrong trying to connect with the OpenAI API"
        );
      }
      const parsedResponse = responseInJson["choices"][0]["message"]["content"];
      // Since our responses are also replied as JSON strings
      const parsedJSONResponse = JSON.parse(parsedResponse);
      return { parsedJSONResponse, uploadedImageLocations };
    } catch (er) {
      console.error(er.message + er.stack);
      await this.logError(`${er.message}`);
    }
  };

  async scrapeDataFromGoogle(businessName, businessData) {
    try {
      const link = `https://www.google.com/search?q=${encodeURIComponent(
        businessName
      )}`;

      const pageGoogleHTML = await this.regularFetch(link);

      const response = await this.openAiWithPrompts([
        {
          role: "user",
          content: `Get the address and phone number of ${businessName} if listed in the following HTML code of the google page. In some instances, you might also be able to pick up the latitude and longitude of the business (in case a link to Google Maps is present). In those cases, please also return the "latitude" and "longitude" in the JSON. Longitude and latitude are optional, and should only be returned if actually found in the code. if they are undefined or not found at all, simply do not return them in the JSON. If none of the data is  found, just return a JSON with data: {}, else, return data:{phone: PHONENUMBER, address: ADDRESS, longitude: LONGITUDE, latitude: LATITUDE}. The PHONENUMBER and ADDRESS should always be a string. If you find multiple phone numbers, just concatenate them with a ','. If there are multiple addresses, just select the first one.
            Here is the html code: ${pageGoogleHTML}
          `,
        },
      ]);

      const { data } = JSON.parse(response);

      if (data.address) {
        businessData.data.googleAddress = data.address;
      }
      if (data.phone) {
        if (businessData.data.phone_number)
          businessData.data.phone_number += ", " + data.phone;
        else businessData.data.phone_number = data.phone;
      }
      if (data.latitude) {
        businessData.data.googleLatitude = data.latitude;
      }
      if (data.longitude) {
        businessData.data.googleLongitude = data.longitude;
      }
    } catch (error) {
      console.error("Error scraping business details from Google:", error);
      businessData.errors.push("Error scraping business details from Google");
      await this.logError(
        `Error scraping business details from Google: ${error}`
      );
    }
    return businessData;
  }

  async scrapeBusinessSite(businessName, businessURL) {
    const prompts = await this.getPrompts();

    //Generating Data:
    let businessData = { errors: [], data: {} };

    // 1. Scrape Business Data using Two Way communication:
    try {
      const { mainSiteData, imagesFromMain } = await this.twoWayComm(
        businessURL,
        prompts
      );

      businessData.data = mainSiteData;
      businessData.data.imagesFromMain = imagesFromMain;
    } catch (e) {
      businessData.errors.push("Main Site not working");
      console.log("Main Site not working".red);
      await this.logError(`Main Site not working`);
    }

    console.log(JSON.stringify(businessData));
    return businessData;
  }

  async scrapePlatforms(originalData, businessData) {
    const prompts = await this.getPrompts();

    const businessName = originalData.businessName;
    businessData.data.scrapeImages = true;
    businessData.data.platformSummaries = {};

    const links = {
      booking: { platformURL: "Booking.com", listingUrl: "" },
      agoda: { platformURL: "agoda.com", listingUrl: "" },
      trip: { platformURL: "Trip.com", listingUrl: "" },
      expedia: { platformURL: "expedia.com", listingUrl: "" },
      trivago: { platformURL: "Trivago.com", listingUrl: "" },
      perfectWave: { platformURL: "perfectwavetravel.com", listingUrl: "" },
      luex: { platformURL: "luex.com", listingUrl: "" },
      waterwaysSurf: { platformURL: "waterwaystravel.com", listingUrl: "" },
      worldSafaris: { platformURL: "worldsurfaris.com", listingUrl: "" },
      awave: { platformURL: "awave.com.au", listingUrl: "" },
      atoll: { platformURL: "atolltravel.com", listingUrl: "" },
      surfHolidays: { platformURL: "surfholidays.com", listingUrl: "" },
      surfline: { platformURL: "surfline.com", listingUrl: "" },
      lushPalm: { platformURL: "", listingUrl: "lushpalm.com" },
      thermalTravel: { platformURL: "thermal.travel", listingUrl: "" },
      bookSurfCamps: { platformURL: "booksurfcamps.com", listingUrl: "" },
      nomadSurfers: { platformURL: "nomadsurfers.com", listingUrl: "" },
      stokedSurfAdventrues: {
        platformURL: "stokedsurfadventures.com",
        listingUrl: "",
      },
      soulSurfTravel: { platformURL: "soulsurftravel.com.au", listingUrl: "" },
      surfersHype: { platformURL: "surfershype.com", listingUrl: "" },
    };

    const linksArr = Object.keys(links);

    // for (var i = 0; i < linksArr.length; i++) {
    for (var i = 0; i < 1; i++) {
      const platformName = linksArr[i];
      const platformURL = links[linksArr[i]].platformURL;
      try {
        const listingUrlData = await this.findListingOnGoogle(
          businessName,
          platformURL
        );

        if (listingUrlData.data) {
          //Scrape Pages from platforms
          links[linksArr[i]].listingUrl = listingUrlData.data;
          const result = await this.puppeteerLoadFetch(
            listingUrlData.data,
            true,
            businessData.data.scrapeImages,
            this.generateSlug(businessName),
            true,
            platformName
          );

          if (platformName == "booking") {
            //Stop scrapping images if booking scraped since all images from booking are scraped
            businessData.data.scrapeImages = false;
          }

          const listingDataFromOpenAi = await this.listingScrape(
            links[linksArr[i]].platformURL,
            businessName,
            result.sanitizedData,
            prompts
          );

          if (listingDataFromOpenAi.error) {
            throw new Error(listingDataFromOpenAi.error);
          }

          businessData.data.platformSummaries[`${platformName}Data`] = {
            link: listingUrlData.data,
            textContent: listingDataFromOpenAi.summary
              ? listingDataFromOpenAi.summary
              : result.sanitizedData,
            highlights: listingDataFromOpenAi.highlights
              ? listingDataFromOpenAi.highlights
              : "",
            images: result.uploadedImageLocations,
            rooms: listingDataFromOpenAi.rooms
              ? listingDataFromOpenAi.rooms
              : [],
            surroundings: listingDataFromOpenAi.surroundings
              ? listingDataFromOpenAi.surroundings
              : [],
            amenities: listingDataFromOpenAi.amenities
              ? listingDataFromOpenAi.amenities
              : [],
          };
        }
      } catch (error) {
        console.log(
          `Something went wrong while scraping from ${platformName}: ${error.message}`
            .red.inverse
        );
        businessData.errors.push(
          `Error while scraping ${platformName}: ${error.message}`
        );

        await this.logError(
          `Error while scraping ${platformName}: ${error.message}`
        );
      }
    }

    console.log(JSON.stringify(businessData));
    return businessData;
  }

  generateFinalContent = async (originalData, businessData) => {
    // const businessData2 = finalData;
    // res.json({ businessData: businessData2 });
    // return;
    const prompts = await this.getPrompts();

    const businessName = originalData.businessName;
    // 4. Generate content

    //Only if there is data:
    const content = await this.generateSEOContentWithGoogle(
      businessData,
      prompts.contentGenerationPromptWithJson,
      true,
      businessName
    );
    const parsedContent = JSON.parse(content);
    if (parsedContent.accomodation_type) {
      businessData.data.accomodation_type = parsedContent.accomodation_type;
    }
    if (parsedContent.trip_type) {
      businessData.data.trip_type = parsedContent.trip_type;
    }
    if (parsedContent.location) {
      businessData.data.location = parsedContent.location;
    }
    if (parsedContent.phone_number) {
      businessData.data.phone_number = parsedContent.phone_number;
    }
    if (parsedContent.whatsapp_number) {
      businessData.data.whatsapp_number = parsedContent.whatsapp_number;
    }
    if (parsedContent.email) {
      businessData.data.email = parsedContent.email;
    }
    if (parsedContent.contact_name) {
      businessData.data.contact_name = parsedContent.contact_name;
    }

    businessData.data.content = parsedContent;

    console.log(JSON.stringify(businessData));
    return businessData;
  };

  listingHasEnoughData = (businessData) => {
    const enoughData =
      businessData.data &&
      (businessData.data.apiData ||
        businessData.data.summary ||
        (businessData.data.platformSummaries &&
          Object.keys(businessData.data.platformSummaries).length));
    this.enoughData = enoughData;
    return enoughData;
  };

  buildBusinessSlug = async (originalData, businessData) => {
    // const businessData2 = regionalOverviewSampleData;
    // res.json({ businessData: businessData2 });
    // return;

    try {
      const prompts = await this.getPrompts();

      // 3. Build Business Slug for yeeew:
      const slug = await this.slugBuilder(
        originalData.businessName,
        businessData.data.location,
        prompts.slugBuilderPrompt
      );
      businessData.data.slug = slug;
    } catch (error) {
      console.error("Error building business slug:", error);
      await this.logError(`Error building business slug: ${error}`);
    }

    console.log(JSON.stringify(businessData));
    return businessData;
  };

  locateBusiness = async (businessData) => {
    // const businessData2 = regionalOverviewSampleData;
    // res.json({ businessData: businessData2 });
    // return;
    try {
      if (
        !businessData.data ||
        (!businessData.data.location && !businessData.data.googleAddress)
      )
        return businessData;

      // Google Maps Geocoding API endpoint

      const locations = await this.fetchGeocodeData(businessData.data.location);
      let lat, lng;
      if (locations.results.length) {
        //Select the first as most likely
        const coordinates = locations.results[0];
        lat = coordinates.geometry.location.lat;
        lng = coordinates.geometry.location.lng;
      }
      businessData.data.coordinates = {
        lat: lat ? lat : 0,
        lng: lng ? lng : 0,
      };
    } catch (error) {
      console.error("Error locating business:", error);
      await this.logError(`Error locating business: ${error}`);
    }
    return businessData;
  };

  async fetchGeocodeData(address) {
    const apiKey = process.env.GEOCODE_API_KEY;
    const geocodingEndpoint =
      "https://maps.googleapis.com/maps/api/geocode/json";

    try {
      const response = await axios.get(geocodingEndpoint, {
        params: {
          address: address,
          key: apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching geocode data:", error);
      await this.logError(`Error fetching geocode data: ${error}`);
    }
  }

  async getPrompts() {
    const prompts = await Prompt.find({});
    return prompts[0];
  }
}
export default Scrapper;
