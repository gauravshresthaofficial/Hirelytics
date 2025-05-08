const Interview = require("../models/interviewModel");

const getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({});
    res.status(200).json(interviews);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    res.status(200).json(interview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createInterview = async (req, res) => {
  const {
    interviewName,
    description,
    duration,
    instructionForInterview,
    mode,
  } = req.body;

  try {
    if (!interviewName) {
      return res.status(400).json({ message: "Interview name is required" });
    }

    const existingInterview = await Interview.findOne({ interviewName });

    if (existingInterview) {
      return res.status(400).json({ message: "Interview already exists" });
    }

    const interview = new Interview({
      interviewName,
      description,
      duration,
      instructionForInterview,
      mode,
    });

    await interview.save();
    res.status(200).json(interview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (
      req.body.interviewName &&
      req.body.interviewName !== interview.interviewName
    ) {
      const existingInterview = await Interview.findOne({
        interviewName: req.body.interviewName,
      });

      if (existingInterview) {
        return res
          .status(400)
          .json({ message: "Interview name already exists" });
      }
    }

    const updates = {
      ...req.body,
    };

    const updateInterview = await Interview.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json(updateInterview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    await Interview.deleteOne({ _id: req.params.id });
    res.status(200).json({
      message: "Interview deleted successfully",
      deletedInterview: interview,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
};
