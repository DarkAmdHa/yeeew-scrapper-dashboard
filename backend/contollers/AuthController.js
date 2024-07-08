import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";

class AuthController {
  constructor() {
    this.model = User;
  }

  authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("Please provide a valid email and password");
    }

    const user = await this.model.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("User not found or invalid credentials");
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  });

  registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please provide a valid name, email and password");
    }

    const userExists = await this.model.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists.");
    }

    const hashedPassword = bcrypt.hashSync(password);

    const user = await this.model.create({
      name,
      email,
      password: hashedPassword,
    });
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.password,
      token: generateToken(user._id),
    });
  });

  updateUser = asyncHandler(async (req, res) => {
    //Passes through middleware, and user is added to the request:
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("Please provide a valid email and password");
    }

    if (req.body.email && user.email != req.body.email) {
      const existingUser = await this.model.findOne({ email: req.body.email });
      if (existingUser) {
        res.status(400);
        throw new Error("User with provided email already exists.");
      }
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.newPassword) {
      if (!req.body.oldPassword) {
        res.status(400);
        throw new Error("Please provide the old password");
      }
      //Check if old password is correct:
      const validated = bcrypt.compareSync(req.body.oldPassword, user.password);
      if (!validated) {
        res.status(400);
        throw new Error("Old password is not correct");
      }

      user.password = bcrypt.hashSync(req.body.newPassword, 10);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    });
  });
  getUser = asyncHandler((req, res) => {
    //Passes through middleware, and user is added to the request:
    const user = req.user;
    if (user) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(404);
      throw new Error("User not found.");
    }
  });
  deleteUser = asyncHandler((req, res) => {
    //Passes through middleware, and user is added to the request:
    const user = req.user;
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  });
}

export default new AuthController();
