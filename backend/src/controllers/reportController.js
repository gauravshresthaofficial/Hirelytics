const mongoose = require("mongoose");
const Candidate = require("../models/candidateModel");
const User = require("../models/userModel");

const handleError = (res, error, message = "Server Error") => {
  console.error(message, error);
  return res.status(500).json({ success: false, error: message });
};

const getCandidatesByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const validStatuses = Candidate.schema.path("currentStatus").enumValues;
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status: ${status}. Valid statuses are: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    const candidates = await Candidate.find({ currentStatus: status })
      .populate("assessments.assessmentId", "assessmentName")
      .populate("interviews.interviewId", "type")
      .select("-__v");

    res.status(200).json({ success: true, data: candidates });
  } catch (error) {
    handleError(res, error, "Failed to retrieve candidates by status");
  }
};

const getCandidatesByPosition = async (req, res) => {
  try {
    const { position } = req.params;

    const candidates = await Candidate.find({ appliedPosition: position })
      .populate("assessments.assessmentId", "assessmentName")
      .populate("interviews.interviewId", "type")
      .select("-__v");

    res.status(200).json({ success: true, data: candidates });
  } catch (error) {
    handleError(res, error, "Failed to retrieve candidates by position");
  }
};

const getAssessmentResults = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid assessment ID" });
    }

    const candidates = await Candidate.find({
      "assessments.assessmentId": assessmentId,
    })
      .populate("assessments.assessmentId", "assessmentName")
      .select("fullName assessments");

    if (!candidates || candidates.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No candidates found for this assessment",
      });
    }

    const results = candidates.map((candidate) => {
      const assessment = candidate.assessments.find(
        (a) => a.assessmentId.toString() === assessmentId
      );
      return {
        candidateId: candidate._id,
        fullName: candidate.fullName,
        score: assessment ? assessment.score : null,
        remarks: assessment ? assessment.remarks : null,
        scheduledDate: assessment ? assessment.scheduledDate : null,
        evaluationDate: assessment ? assessment.evaluationDate : null,
      };
    });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    handleError(res, error, "Failed to retrieve assessment results");
  }
};

const getInterviewResults = async (req, res) => {
  try {
    const { interviewType } = req.params;

    const candidates = await Candidate.find({
      "interviews.interviewType": interviewType,
    })
      .populate("interviews.interviewId", "type")
      .select("fullName interviews");

    if (!candidates || candidates.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No candidates found for this interview type",
      });
    }

    const results = candidates.map((candidate) => {
      const interview = candidate.interviews.find(
        (i) => i.interviewType === interviewType
      );
      return {
        candidateId: candidate._id,
        fullName: candidate.fullName,
        scheduledDatetime: interview ? interview.scheduledDatetime : null,
        conductedDate: interview ? interview.conductedDate : null,
        score: interview ? interview.score : null,
        remarks: interview ? interview.remarks : null,
      };
    });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    handleError(res, error, "Failed to retrieve interview results");
  }
};

const getCandidatesByStageCount = async (req, res) => {
  try {
    const result = await Candidate.aggregate([
      {
        $group: {
          _id: "$currentStatus",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);

    const stageCounts = {};
    result.forEach((item) => {
      stageCounts[item.status] = item.count;
    });

    const allStatuses = Candidate.schema.path("currentStatus").enumValues;
    allStatuses.forEach((status) => {
      if (!stageCounts[status]) {
        stageCounts[status] = 0;
      }
    });

    res.status(200).json({ success: true, data: stageCounts });
  } catch (error) {
    handleError(res, error, "Failed to retrieve candidate stage counts");
  }
};

const getEvaluatorList = async (req, res) => {
  try {
    const evaluators = await User.find({ role: /^evaluator$/i }).select(
      "_id fullName email"
    );
    res.status(200).json({ success: true, data: evaluators });
  } catch (error) {
    handleError(res, error, "Failed to retrieve evaluator list");
  }
};

const getCandidatesByEvaluatorForAssessment = async (req, res) => {
  try {
    const { evaluatorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(evaluatorId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid evaluator ID" });
    }

    const candidates = await Candidate.find({
      "assessments.assignedEvaluatorId": evaluatorId,
    })
      .populate("assessments.assessmentId", "assessmentName")
      .select("fullName assessments");

    res.status(200).json({ success: true, data: candidates });
  } catch (error) {
    handleError(
      res,
      error,
      "Failed to retrieve candidates by evaluator for assessment"
    );
  }
};

const getCandidatesByEvaluatorForInterview = async (req, res) => {
  try {
    const { evaluatorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(evaluatorId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid evaluator ID" });
    }

    const candidates = await Candidate.find({
      "interviews.assignedEvaluatorId": evaluatorId,
    })
      .populate("interviews.interviewId", "type")
      .select("fullName interviews");

    res.status(200).json({ success: true, data: candidates });
  } catch (error) {
    handleError(
      res,
      error,
      "Failed to retrieve candidates by evaluator for interview"
    );
  }
};

module.exports = {
  getCandidatesByStatus,
  getCandidatesByPosition,
  getAssessmentResults,
  getInterviewResults,
  getCandidatesByStageCount,
  getEvaluatorList,
  getCandidatesByEvaluatorForAssessment,
  getCandidatesByEvaluatorForInterview,
};
