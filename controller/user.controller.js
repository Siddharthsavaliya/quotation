const User = require("../model/user.model");
const response = require("../helper/response");
const jwt = require("jsonwebtoken");
const { handleMongoError } = require("../utils/errorHandler");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(response(false, "Please provide email and password"));
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json(response(false, "Invalid email or password"));
    }

    const token = generateToken(user._id);
    res.status(200).json(
      response(true, "Login successful", {
        token,
        role: user.role,
      })
    );
  } catch (error) {
    const errorResponse = handleMongoError(error);
    res.status(400).json(errorResponse);
  }
};

// Create user (admin only)
const createUser = async (req, res) => {
  try {
    // Check if user with email or number already exists
    const { email, number } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { number }] });

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "number";
      return res
        .status(400)
        .json(
          response(
            false,
            `This ${field} is already registered. Please use a different ${field}.`
          )
        );
    }

    const user = await User.create(req.body);
    res.status(201).json(response(true, "User created successfully", user));
  } catch (error) {
    const errorResponse = handleMongoError(error);
    res.status(400).json(errorResponse);
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(response(true, "Users fetched successfully", users));
  } catch (error) {
    const errorResponse = handleMongoError(error);
    res.status(500).json(errorResponse);
  }
};

// Get user profile (for logged in user)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(response(true, "Profile fetched successfully", user));
  } catch (error) {
    const errorResponse = handleMongoError(error);
    res.status(500).json(errorResponse);
  }
};

// Update user (admin or own profile)
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;

    // Check if update data contains unique fields
    if (req.body.email || req.body.number) {
      const { email, number } = req.body;
      const existingUser = await User.findOne({
        _id: { $ne: userId },
        $or: [...(email ? [{ email }] : []), ...(number ? [{ number }] : [])],
      });

      if (existingUser) {
        const field = existingUser.email === email ? "email" : "number";
        return res
          .status(400)
          .json(
            response(
              false,
              `This ${field} is already registered. Please use a different ${field}.`
            )
          );
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { ...req.body } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json(response(false, "User not found"));
    }

    res
      .status(200)
      .json(response(true, "User updated successfully", updatedUser));
  } catch (error) {
    const errorResponse = handleMongoError(error);
    res.status(400).json(errorResponse);
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json(response(false, "User not found"));
    }
    res.status(200).json(response(true, "User deleted successfully"));
  } catch (error) {
    const errorResponse = handleMongoError(error);
    res.status(500).json(errorResponse);
  }
};

module.exports = {
  login,
  createUser,
  getAllUsers,
  getProfile,
  updateUser,
  deleteUser,
};
