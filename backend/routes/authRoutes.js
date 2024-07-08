import express from "express";
import AuthController from "../contollers/AuthController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @desc    Auth User & get JWT token
// @route   POST /api/auth/login
// @access  Public
router.post("/login", AuthController.authUser);

// @desc    Register User & get JWT token
// @route   POST /api/auth/register
// @access  Public
router.post("/register", AuthController.registerUser);

// @desc    Everything to do with users
// @route   POST,PUT,DELETE  /api/auth/profile
// @access  Private
router
  .route("/profile")
  .get(protect, AuthController.getUser)
  .put(protect, AuthController.updateUser)
  .delete(protect, AuthController.deleteUser);

export default router;
