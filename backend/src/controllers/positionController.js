const Position = require("../models/positionModel");

const getAllPositions = async (req, res) => {
  try {
    const positions = await Position.find({});
    res.status(200).json(positions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getPositionById = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id);

    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    res.status(200).json(position);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createPosition = async (req, res) => {
  const {
    positionName,
    description,
    department,
    requiredSkills,
    responsibilities,
    qualifications,
    salaryRange,
  } = req.body;

  try {
    if (!positionName) {
      return res.status(400).json({ message: "Position name is required" });
    }

    const existingPosition = await Position.findOne({ positionName });
    if (existingPosition) {
      return res.status(400).json({ message: "Position already exists" });
    }

    const position = new Position({
      positionName,
      description,
      department,
      requiredSkills: requiredSkills || [],
      responsibilities: responsibilities || [],
      qualifications: qualifications || [],
      salaryRange: salaryRange || { min: 0, max: 0 },
    });

    await position.save();

    res.status(201).json(position);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updatePosition = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id);

    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    if (
      req.body.positionName &&
      req.body.positionName !== position.positionName
    ) {
      const existingPosition = await Position.findOne({
        positionName: req.body.positionName,
        _id: { $ne: req.params.id },
      });
      if (existingPosition) {
        return res
          .status(400)
          .json({ message: "Position name already exists" });
      }
    }

    const updates = {
      ...req.body,
    };

    const updatedPosition = await Position.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedPosition);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deletePosition = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id);

    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    await Position.deleteOne({ _id: req.params.id });

    res.status(200).json({
      message: "Position deleted successfully",
      deletedPosition: position,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
};
