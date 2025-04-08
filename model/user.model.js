const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
    },
    number: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Check the comparePassword method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // Make sure both values are strings to avoid "Illegal arguments: string, object" error
    if (
      typeof candidatePassword !== "string" ||
      typeof this.password !== "string"
    ) {
      return false;
    }

    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
