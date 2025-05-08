const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema({
  assessmentName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  maxScore: {
    type: Number,
    required: true,
    min: 1,
  },
  duration: { type: Number, default: 60 },
  mode: {
    type: String,
    enum: ["Online", "Offline"],
    required: true,
  },
});

module.exports = mongoose.model("Assessment", assessmentSchema);
