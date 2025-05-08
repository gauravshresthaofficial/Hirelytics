const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ["hr", "evaluator", "admin"],
    default: "admin",
    trim: true,
  },
  googleId: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },
  picture: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
