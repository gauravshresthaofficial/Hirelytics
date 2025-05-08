const mongoose = require("mongoose");

const positionSchema = new mongoose.Schema({
  positionName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  requiredSkills: [
    {
      type: String,
      trim: true,
    },
  ],
  responsibilities: [
    {
      type: String,
      trim: true,
    },
  ],
  qualifications: [
    {
      type: String,
      trim: true,
    },
  ],
  salaryRange: {
    min: {
      type: Number,
      min: 0,
    },
    max: {
      type: Number,
      min: 0,
    },
  },
});

module.exports = mongoose.model("Position", positionSchema);
