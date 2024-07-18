import Listing from "../models/listingModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

import asyncHandler from "express-async-handler";

import multer from "multer";
import csvParser from "csv-parser";
import fs from "fs";
import stream from "stream";

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
    };

    if (req.user) {
      listingObject.user = req.user._id;
    }

    const listing = await new this.model(listingObject);

    listing.save();

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
        customSlug: new RegExp(region, "i"),
      }));
    }

    try {
      const listings = await this.model
        .find(filters)
        .select("businessName businessURL scraped scrapedAt timeToScrape")
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
            !headers.includes("Business Name") ||
            !headers.includes("Business URL")
          ) {
            errors.push(
              "CSV must contain 'Business Name' and 'Business URL' columns."
            );
          }
        })
        .on("data", (data) => {
          if (data["Business Name"]) {
            listings.push({
              businessName: data["Business Name"],
              businessURL: data["Business URL"] ? data["Business URL"] : "",
              user: req.user._id,
            });
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
            res
              .status(201)
              .json({ message: "Businesses Added", listings: savedListings });
          } catch (error) {
            res.status(500);
            throw new Error("Error while saving listings");
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
}

export default new ListingController();
