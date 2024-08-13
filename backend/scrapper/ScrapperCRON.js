import Operation from "../models/operationModel.js";
import Listing from "../models/listingModel.js";
import Scrapper from "./Scrapper.js";
import Export from "./Exporter.js";

const TIMEOUT_THRESHOLD_MULTIPLIER = 20 * 60 * 1000; // 20 minutes in milliseconds

export async function checkAndInitiateScrappingOperation() {
  try {
    const now = Date.now();
    const runningOperations = await Operation.find({
      status: "running",
      type: "Scrape",
    });

    //Timeout operations
    for (const operation of runningOperations) {
      const maxTime = operation.listings.length * TIMEOUT_THRESHOLD_MULTIPLIER;
      if (
        now - new Date(operation.startedAt).getTime() > maxTime &&
        operation.status == "running"
      ) {
        operation.status = "timed-out";
        await operation.save();
        console.log(`Scrape operation ${operation._id} has timed out`.red);
      }
    }

    if (runningOperations.length === 0) {
      const queuedOperations = await Operation.find({
        status: "queued",
        type: "Scrape",
      });

      if (queuedOperations.length > 0) {
        // Get the first queued operation
        const newOperation = queuedOperations[0];

        console.log("Initiated a queued Scrape operation".yellow);
        // Run operation:
        const listings = newOperation.listings;
        for (let i = 0; i < listings.length; i++) {
          // Find listing:
          const listing = await Listing.findById(listings[i]);
          if (listing) {
            const data = {
              businessName: listing.businessName,
              businessLocation: listing.businessLocation
                ? listing.businessLocation
                : "",
              businessURL: listing.businessURL ? listing.businessURL : "",
              _id: listing._id,
            };

            const scrapper = new Scrapper(data, newOperation._id);
            await scrapper.init();
          }
        }
      } else {
        console.log("No queued Scrape operations found".yellow);
      }
    } else {
      console.log("There are Scrape operations running".yellow);
    }
  } catch (error) {
    console.error(`Error checking and initiating operation: ${error}`.red);
  }
}
export async function checkAndInitiateExportOperation() {
  try {
    const now = Date.now();
    const runningOperations = await Operation.find({
      status: "running",
      type: "Export",
    });

    //Timeout operations
    for (const operation of runningOperations) {
      const maxTime = operation.listings.length * TIMEOUT_THRESHOLD_MULTIPLIER;
      if (
        now - new Date(operation.startedAt).getTime() > maxTime &&
        operation.status == "running"
      ) {
        operation.status = "timed-out";
        await operation.save();
        console.log(`Export operation ${operation._id} has timed out`.red);
      }
    }

    if (runningOperations.length === 0) {
      const queuedOperations = await Operation.find({
        status: "queued",
        type: "Export",
      });

      if (queuedOperations.length > 0) {
        // Get the first queued operation
        const newOperation = queuedOperations[0];

        console.log("Initiated a queued Export operation".cyan);
        // Run operation:
        const listings = newOperation.listings;
        for (let i = 0; i < listings.length; i++) {
          // Find listing:
          const listing = await Listing.findById(listings[i]);
          if (listing) {
            const data = {
              businessName: listing.businessName,
              businessURL: listing.businessURL ? listing.businessURL : "",
              _id: listing._id,
            };

            const exportOperation = new Export(listing, newOperation._id);
            await exportOperation.init();
          }
        }
      } else {
        console.log("No queued Export operations found".cyan);
      }
    } else {
      console.log("There are Export operations running".cyan);
    }
  } catch (error) {
    console.error(
      `Error checking and initiating Export operation: ${error}`.red
    );
  }
}
