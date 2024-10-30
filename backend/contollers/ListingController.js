import Listing from "../models/listingModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

import asyncHandler from "express-async-handler";

import multer from "multer";
import csvParser from "csv-parser";
import fs from "fs";
import stream from "stream";

import Scrapper from "../scrapper/Scrapper.js";
import TripAdvisorFetcher from "../scrapper/TripAdvisorFetcher.js";
import AgodaAPIFetcher from "../scrapper/AgodaAPIFetcher.js";
import HotelsAPIFetcher from "../scrapper/HotelsAPIFetcher.js";
import BookingAPIFetcher from "../scrapper/BookingAPIFetcher.js";
import PricelineAPIFetcher from "../scrapper/PricelineAPIFetcher.js";
import Operation from "../models/operationModel.js";
const scrapper = new Scrapper();

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(csv)$/)) {
      return cb(new Error("Please upload a CSV file"));
    }
    cb(null, true);
  },
});

class ListingController {
  constructor() {
    this.model = Listing;
  }

  getListing = asyncHandler(async (req, res) => {
    const listingId = req.params.id;
    if (mongoose.Types.ObjectId.isValid(listingId)) {
      const listing = await this.model.findById(listingId);
      if (listing) res.json(listing);
      else {
        res.status(404);
        throw new Error("Listing Not Found");
      }
    } else {
      res.status(400);
      throw new Error("Not a valid listing ID");
    }
  });

  createListing = asyncHandler(async (req, res) => {
    const listingData = req.body.data;
    const listingObject = {
      businessName: listingData.businessName,
      businessURL: listingData.businessURL,
      businessLocation: listingData.businessLocation,
    };

    if (req.user) {
      listingObject.user = req.user._id;
    }

    const listing = await new this.model(listingObject);

    await listing.save();

    try {
      await scrapper.locateListing(listing._id);
    } catch (error) {
      console.log("Business could not be located: ", error);
    }

    res.json(listing);
  });

  updateListing = asyncHandler(async (req, res) => {
    const listingId = req.body.id;
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      res.status(400);
      throw new Error("Not a valid listing ID");
    }
    const listing = await this.model.findById(listingId);
    if (!listing) {
      res.status(404);
      throw new Error("Listing Not Found");
    }

    const listingData = req.body.listingData;
    const newListing = {
      ...listing,
      ...listingData,
    };

    if (!newListing.user) {
      await this.authUser(req, res);

      if (req.user) {
        listing.user = req.user._id;
      }
    }
    const updatedListing = await listing.save();

    res.json(updatedListing);
  });

  deleteListing = asyncHandler(async (req, res) => {
    const listingId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      res.status(400);
      throw new Error("Not a valid listing ID");
    }
    const listing = await this.model.findById(listingId);
    if (!listing) {
      res.status(404);
      throw new Error("Listing Not Found");
    }
    await listing.delete();

    res.json({
      success: true,
      message: "Listing Deleted",
    });
  });

  authUser = asyncHandler(async (req, res) => {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.SECRET);
        req.user = await User.findById(decoded.id).select("-password");
      } catch (error) {
        console.log(error);
        res.status(401);
        throw new Error("Not authorized. Token expired.");
      }
    }
  });

  getListings = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const sort = req.query.sort || "-createdAt";
    const query = req.query.query || "";
    let regionFilters = req.query.regionFilters || "";
    if (regionFilters) {
      regionFilters = regionFilters.split(",");
    }
    const scraped =
      sort === "scraped" ? true : sort === "notScraped" ? false : null;

    const filters = {};

    if (scraped !== null) {
      filters.scraped = scraped;
    }

    if (regionFilters.length > 0) {
      filters.$or = regionFilters.map((region) => ({
        $or: [
          {
            customSlug: new RegExp(region, "i"),
          },
          { country: new RegExp(region.slice(1), "i") },
        ],
      }));
    }

    if (query) {
      filters.$and = [
        ...(filters.$or ? [{ $or: filters.$or }] : []),
        {
          $or: [
            { businessName: new RegExp(query, "i") },
            { businessURL: new RegExp(query, "i") },
            { businessLocation: new RegExp(query, "i") },
          ],
        },
      ];
      delete filters.$or;
    }

    try {
      const listings = await this.model
        .find(filters)
        .select(
          "businessName businessURL businessLocation scraped scrapedAt timeToScrape"
        )
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      const totalListings = await this.model.countDocuments(filters);

      res.json({
        listings,
        currentPage: page,
        totalPages: Math.ceil(totalListings / limit),
        totalCount: totalListings,
      });
    } catch (error) {
      res.status(500);
      throw new Error("Error while fetching listings");
    }
  });
  bulkImport = [
    upload.single("file"),
    asyncHandler(async (req, res) => {
      const { file } = req;
      if (!file) {
        res.status(400);
        throw new Error("No file uploaded");
      }

      const listings = [];
      const errors = [];

      const bufferStream = new stream.PassThrough();
      bufferStream.end(file.buffer);

      bufferStream
        .pipe(csvParser())
        .on("headers", (headers) => {
          if (
            !headers.includes("Holiday Name") ||
            !headers.includes("Resort URL")
          ) {
            errors.push(
              "CSV must contain 'Holiday Name' and 'Resort URL' columns."
            );
          }
        })
        .on("data", (data) => {
          if (data["Holiday Name"]) {
            const dataToPush = {
              businessName: data["Holiday Name"],
              businessURL: data["Resort URL"] ? data["Resort URL"] : "",
              user: req.user._id,
            };
            if (data["Location"])
              dataToPush.businessLocation = data["Location"];
            listings.push(dataToPush);
          } else {
            errors.push(`Invalid row data: ${JSON.stringify(data)}`);
          }
        })
        .on("end", async () => {
          if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
          }

          try {
            const savedListings = await this.model.insertMany(listings);

            for (let i = 0; i < savedListings.length; i++) {
              try {
                await scrapper.locateListing(savedListings[i]._id);
              } catch (error) {
                console.log(
                  "Business could not be located: " + error + savedListings[i]
                );
              }
            }
            res
              .status(201)
              .json({ message: "Businesses Added", listings: savedListings });
          } catch (error) {
            res.status(500);
            console.log("Error while saving listings: ", error);
          }
        })
        .on("error", (error) => {
          res.status(500);
          throw new Error("Error while processing CSV file");
        });
    }),
  ];

  deleteListings = asyncHandler(async (req, res) => {
    const { listings } = req.body.data;

    try {
      const deleteResults = await Promise.all(
        listings.map(async (listingId) => {
          const listing = await Listing.findById(listingId);
          if (!listing) {
            return {
              success: false,
              message: `Listing ${listingId} not found`,
            };
          }
          await listing.deleteOne();
          return {
            success: true,
            message: `Listing ${listingId} deleted successfully`,
          };
        })
      );

      res.json(deleteResults);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  });

  refetchReviews = asyncHandler(async (req, res) => {
    const { apiListingId } = req.body;
    const { id } = req.params;
    if (!id) {
      res.status(400);
      throw new Error("Listing ID required");
    }

    const business = await Listing.findById(id);

    if (!business) {
      res.status(404);
      throw new Error("Listing not found");
    }

    try {
      let apiResponse;
      if (apiListingId && true) {
        //Refetch Reviews:

        const reviewsFetcher = new TripAdvisorFetcher(
          business.businessName,
          apiListingId
        );
        apiResponse = await reviewsFetcher.init();

        if (apiResponse.id && apiResponse.data) {
          business.apiData.tripadvisor = apiResponse;
        }
      } else {
        const reviewsFetcher = new TripAdvisorFetcher(business.businessName);
        apiResponse = await reviewsFetcher.init();

        if (apiResponse && apiResponse.id) {
          business.apiData.tripadvisor = apiResponse;
        }
      }

      if (
        apiResponse &&
        apiResponse.id &&
        apiResponse.data &&
        apiResponse.data.reviews.length
      ) {
        await business.save();
        res.json({
          found: true,
          message: "Reviews Refetched",
        });
      } else {
        res.json({
          found: false,
          message:
            "Reviews Refetched but no listing for the business was found.",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500);
      throw new Error("Something went wrong while refetching reviews");
    }
  });

  refetchAPIData = asyncHandler(async (req, res) => {
    const { apiListingId, apiHandle } = req.body;
    const { id } = req.params;
    if (!id) {
      res.status(400);
      throw new Error("Listing ID required");
    }
    const apis = {
      hotels: HotelsAPIFetcher,
      booking: BookingAPIFetcher,
      priceline: PricelineAPIFetcher,
    };
    if (!apiHandle || !Object.keys(apis).includes(apiHandle)) {
      res.status(400);
      throw new Error("Please provide a valid api handle");
    }

    const business = await Listing.findById(id);

    if (!business) {
      res.status(404);
      throw new Error("Listing not found");
    }

    const APIDataFetcher = apis[apiHandle];
    try {
      let apiResponse;
      //Nevermind, always get fresh data:
      if (apiListingId && false) {
        //Refetch data:
        const dataFetcher = new APIDataFetcher(
          business.businessName,
          apiListingId
        );
        apiResponse = await dataFetcher.init();

        if (apiResponse.id && apiResponse.data) {
          business.apiData[apiHandle] = {
            ...(business.apiData["apiHandle"] &&
              business.apiData[apiHandle]._doc),
            ...apiResponse,
          };
        }
      } else {
        const dataFetcher = new APIDataFetcher(business.businessName);
        apiResponse = await dataFetcher.init();

        if (apiResponse && apiResponse.id) {
          business.apiData[apiHandle] = apiResponse;
        }
      }

      if (apiResponse && apiResponse.id && apiResponse.data) {
        await business.save();
        res.json({
          found: true,
          message: "Data Refetched",
        });
      } else {
        res.json({
          found: false,
          message: "Data Refetched but no listing for the business was found.",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500);
      throw new Error("Something went wrong while refetching reviews");
    }
  });
  refetchPrices = asyncHandler(async (req, res) => {
    //Refetch all the prices for this listing:

    //This will entail going through all the Scrapper process but only for the platforms
    //And also refetch all the APIs data:

    const { id } = req.params;
    if (!id) {
      res.status(400);
      throw new Error("Listing ID required");
    }

    const business = await Listing.findById(id);

    if (!business) {
      res.status(404);
      throw new Error("Listing not found");
    }

    try {
      const runningOperation = await Operation.findOne({
        status: "running",
      });

      const newOperation = await Operation.create({
        type: "Scrape",
        listings: [business._id],
        totalListings: 1,
        status: "queued",
        initiatedBy: req.user._id,
      });
      res.status(201).json({ message: "Operation initiated" });

      if (!runningOperation) {
        //No running operations:

        const data = {
          businessName: business.businessName,
          businessLocation: business.businessLocation
            ? business.businessLocation
            : "",
          businessURL: business.businessURL ? business.businessURL : "",
          _id: business._id,
          data: {},
          listingObject: business,
        };

        const scrapper = new Scrapper(data, newOperation._id, true);
        await scrapper.init();
      }
    } catch (error) {
      console.log(error);
      res.status(500);
      throw new Error("Something went wrong while refetching prices");
    }
  });

  refetchAgoda = asyncHandler(async (req, res) => {
    const { customName } = req.body;
    const { id } = req.params;
    if (!id) {
      res.status(400);
      throw new Error("Listing ID required");
    }
    if (!customName) {
      res.status(400);
      throw new Error("Business name required");
    }

    const business = await Listing.findById(id);

    if (!business) {
      res.status(404);
      throw new Error("Listing not found");
    }

    try {
      const resortFetcher = new AgodaAPIFetcher(customName);
      const apiResponse = await resortFetcher.lookupBusiness();

      if (apiResponse && apiResponse.id) {
        business.apiData.agoda = apiResponse;
      }

      if (apiResponse && apiResponse.id && apiResponse.data) {
        await business.save();
        res.json({
          found: true,
          message: "Agoda Data Refetched",
        });
      } else {
        //Remove any existing erroneous one:
        const { agoda, ...updatedApiData } = business.apiData;

        business.apiData = { ...updatedApiData };
        await business.save();

        res.json({
          found: true,
          message:
            "Agoda Data was rechecked but no listing for the business was found.",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500);
      throw new Error("Something went wrong while refetching data from Agoda");
    }
  });
}

export default new ListingController();
