import Listing from "../models/listingModel.js";
import Operation from "../models/operationModel.js";
import asyncHandler from "express-async-handler";
import Scrapper from "../scrapper/Scrapper.js";
import Export from "../scrapper/Exporter.js";

class OperationController {
  constructor() {
    this.model = Operation;
  }

  getPaginatedOperations = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const operations = await this.model
      .find({})
      .select("status totalListings initiatedBy type")
      .populate({
        path: "initiatedBy",
        select: "_id name email",
      })
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit);

    const totalOperations = await this.model.countDocuments({});

    res.json({
      operations,
      currentPage: page,
      totalPages: Math.ceil(totalOperations / limit),
      totalCount: totalOperations,
    });
  });

  getOperationById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const operation = await this.model
      .findById(id)
      .populate("initiatedBy", "_id name email")
      .populate("listings", "_id businessName")
      .populate("errorListings.listingId", "_id businessName");

    if (!operation) {
      res.status(404);
      throw new Error("Operation not found");
    }

    res.json(operation);
  });

  updateOperation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
      const updatedOperation = await this.model.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedOperation) {
        res.status(404);
        throw new Error("Operation not found");
      }

      res.json(updatedOperation);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  });

  cancelOperation = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      const updatedOperation = await this.model.findByIdAndUpdate(
        id,
        { status: "cancelled" },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedOperation) {
        res.status(404);
        throw new Error("Operation not found");
      }

      res.json(updatedOperation);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  });

  getRecentExportOperation = asyncHandler(async (req, res) => {
    const operation = await this.model
      .findOne({ type: "Export", status: "running" })
      .sort({ createdAt: -1 });

    if (!operation) {
      res.status(404);
      throw new Error("No running export operation found");
    }

    res.json(operation);
  });

  getRecentScrapeOperation = asyncHandler(async (req, res) => {
    const operation = await this.model
      .findOne({ type: "Scrape", status: "running" })
      .select("totalListings processedListings")
      .sort({ createdAt: -1 });

    if (!operation) {
      res.json({});
      return;
    }

    res.json(operation);
  });

  createOperation = asyncHandler(async (req, res) => {
    const { listings, type, exportToYeeewTest } = req.body.data;
    if (!type || (type != "Scrape" && type != "Export")) {
      res.status(400);
      throw new Error("Operation Type required");
    }
    if (typeof exportToYeeewTest == undefined) {
      res.status(400);
      throw new Error("Please specify where to export");
    }

    try {
      // Create new operation in the database
      const newOperation = await this.model.create({
        type,
        listings,
        totalListings: listings.length,
        status: "queued",
        initiatedBy: req.user._id,
        exportToYeeewTest,
      });

      res.status(201).json(newOperation);

      //Run operation:
      const runningOperation = await this.model.findOne({
        status: "running",
      });

      if (!runningOperation) {
        // if (true) {
        const listings = newOperation.listings;
        //No running operations:

        for (let i = 0; i < listings.length; i++) {
          //Find listing:
          const listing = await Listing.findById(listings[i]);
          if (listing) {
            const data = {
              businessName: listing.businessName,
              businessLocation: listing.businessLocation
                ? listing.businessLocation
                : "",
              businessURL: listing.businessURL ? listing.businessURL : "",
              _id: listing,
            };

            if (type == "Scrape") {
              const scrapper = new Scrapper(data, newOperation._id);
              await scrapper.init();
            } else {
              const exportOperation = new Export(listing, newOperation._id);
              await exportOperation.init();
            }
          }
        }
      }
    } catch (error) {
      res.status(400);
      throw error;
    }
  });
}

export default new OperationController();
