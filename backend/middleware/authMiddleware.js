import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";

export const protect = asyncHandler(async (req, res, next) => {
  let token;
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

  if (!token) {
    res.status(401);
    throw new Error("Not authorized. No token.");
  }

  next();
});
