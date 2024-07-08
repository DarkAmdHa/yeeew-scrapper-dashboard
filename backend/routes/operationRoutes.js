import express from "express";
import OperationController from "../contollers/OperationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @desc    Create an Operation
// @route   POST /api/operations
// @access  Private
router.route("/").post(protect, OperationController.createOperation);

// @desc    Fetch Paginated Operations
// @route   GET /api/operations
// @access  Private
router.route("/").get(protect, OperationController.getPaginatedOperations);

// @desc    Get Recent Export Operation
// @route   GET /api/operations/recent-export
// @access  Private
router
  .route("/recent-export")
  .get(protect, OperationController.getRecentExportOperation);

// @desc    Get Recent Scrape Operation
// @route   GET /api/operations/recent-scrape
// @access  Private
router
  .route("/recent-scrape")
  .get(protect, OperationController.getRecentScrapeOperation);

// @desc    Get Operation by ID
// @route   GET /api/operations/:id
// @access  Private
router.route("/:id").get(protect, OperationController.getOperationById);

// @desc    Update Operation
// @route   PUT /api/operations/:id
// @access  Private
router.route("/:id").put(protect, OperationController.updateOperation);

// @desc    Cancel Operation
// @route   PUT /api/operations/:id/cancel
// @access  Private
router.route("/:id/cancel").put(protect, OperationController.cancelOperation);

export default router;
