const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  interviewName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
  },
  duration: { type: Number, default: 60 },
  instructionForInterview: {
    type: String,
    trim: true,
  },
  mode: {
    type: String,
    enum: ["Online", "In-Person"],
    required: true,
  },
});

module.exports = mongoose.model("Interview", interviewSchema);
