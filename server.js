require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./model/user.model");
const userRoutes = require("./route/user.route");
const customerRoutes = require("./route/customer.route");
const quotationRoutes = require("./route/quotation.route");
const machineRoutes = require("./route/machine.route");
const machineFormRoutes = require("./route/machineForm.route");
const response = require("./helper/response");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Home route with a beautiful landing page
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quotation Management System</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .container {
          background: white;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 800px;
          width: 100%;
        }
        
        h1 {
          color: #2c3e50;
          margin-bottom: 20px;
          font-size: 2.5em;
        }
        
        p {
          color: #34495e;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        
        .feature {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
          transition: transform 0.3s ease;
        }
        
        .feature:hover {
          transform: translateY(-5px);
        }
        
        .feature h3 {
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        .feature p {
          color: #7f8c8d;
          font-size: 0.9em;
          margin: 0;
        }
        
        .cta-button {
          display: inline-block;
          padding: 15px 30px;
          background: #3498db;
          color: white;
          text-decoration: none;
          border-radius: 25px;
          font-weight: bold;
          transition: background 0.3s ease;
        }
        
        .cta-button:hover {
          background: #2980b9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to Quotation Management System</h1>
        <p>A comprehensive solution for managing your business quotations efficiently and professionally.</p>
        
        <div class="features">
          <div class="feature">
            <h3>Easy Quotation Creation</h3>
            <p>Create professional quotations in minutes with our intuitive interface</p>
          </div>
          <div class="feature">
            <h3>Customer Management</h3>
            <p>Manage your customer database efficiently with detailed profiles</p>
          </div>
          <div class="feature">
            <h3>PDF Generation</h3>
            <p>Generate professional PDF quotations instantly</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/machines", machineRoutes);
app.use("/api/machine-forms", machineFormRoutes);

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

const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
