require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./model/user.model");
const userRoutes = require("./route/user.route");
const response = require("./helper/response");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(response(false, "Something went wrong!"));
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Check if admin exists, if not create one
    try {
      const adminExists = await User.findOne({ role: "admin" });
      if (!adminExists) {
        await User.create({
          username: "admin",
          password: "admin123",
          email: "admin@example.com",
          number: "1234567890",
          role: "admin",
        });
        console.log("Admin user seeded successfully");
      }
    } catch (error) {
      console.error("Error seeding admin:", error);
    }
  })
  .catch((error) => console.error("MongoDB connection error:", error));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
