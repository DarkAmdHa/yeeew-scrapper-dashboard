import express from "express";
import ListingController from "../contollers/ListingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @desc    Everything to do with listings
// @route   GET, POST,PUT  /api/listing/
// @route   GET /api/listing/:id
// @access  Private
router
  .route("/")
  .get(protect, ListingController.getListings)
  .post(protect, ListingController.createListing)
  .put(protect, ListingController.updateListing);
router.post("/delete-listings", protect, ListingController.deleteListings);

router.post("/:id/refetchReviews", protect, ListingController.refetchReviews);
router.post("/:id/refetchAgoda", protect, ListingController.refetchAgoda);

router.get("/:id", protect, ListingController.getListing);

router.delete("/:id", protect, ListingController.deleteListing);

router.post("/bulk-import", protect, ListingController.bulkImport);

export default router;
