const Assessment = require("../models/assessmentModel");

const getAllAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({});
    res.status(200).json(assessments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    res.status(200).json(assessment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createAssessment = async (req, res) => {
  const { assessmentName, description, maxScore, duration, mode, category } =
    req.body;

  try {
    if (!assessmentName) {
      return res.status(400).json({ message: "Assessment name is required" });
    }

    const existingAssessment = await Assessment.findOne({
      assessmentName,
    });
    if (existingAssessment) {
      return res.status(400).json({ message: "Assessment already exists" });
    }

    const assessment = new Assessment({
      assessmentName,
      description,
      maxScore,
      duration,
      mode,
      category,
    });

    await assessment.save();
    res.status(201).json(assessment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Check if the new assessment name matches any other assessment's name
    if (
      req.body.assessmentName &&
      req.body.assessmentName !== assessment.assessmentName
    ) {
      const existingAssessment = await Assessment.findOne({
        assessmentName: req.body.assessmentName,
        _id: { $ne: req.params.id },
      });

      if (existingAssessment) {
        return res
          .status(400)
          .json({ message: "Assessment name already exists" });
      }
    }

    const updates = {
      ...req.body,
    };

    const updatedAssessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedAssessment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    await Assessment.deleteOne({ _id: req.params.id });
    res.status(200).json({
      message: "Assessment deleted successfully",
      deletedAssessment: assessment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    console.error(error);
  }
};

module.exports = {
  getAllAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
};
