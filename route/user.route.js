const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth.middleware");
const {
  login,
  createUser,
  getAllUsers,
  getProfile,
  updateUser,
  deleteUser,
} = require("../controller/user.controller");

// Public routes
router.post("/login", login);

// Protected routes
router.use(protect);

// User routes
router.get("/profile", getProfile);
router.patch("/profile", updateUser);

// Admin only routes
router.use(restrictTo("admin"));
router.post("/", createUser);
router.get("/", getAllUsers);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
