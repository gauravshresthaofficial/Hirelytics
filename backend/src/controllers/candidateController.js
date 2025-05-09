const mongoose = require("mongoose");
const Candidate = require("../models/candidateModel");
const Assessment = require("../models/assessmentModel");
const Interview = require("../models/interviewModel");
const User = require("../models/userModel");
const Position = require("../models/positionModel");
const {
  updateAssessmentStatus,
  updateInterviewStatus,
  determineOverallStatus,
  canScheduleAssessment,
  canScheduleInterview,
} = require("../utils/helper");

const handleError = (res, error, message = "Server Error") => {
  console.error(message, error);
  return res.status(500).json({ success: false, error: message });
};

const getAllCandidates = async (req, res) => {
  try {
    let candidates = await Candidate.find()
      .populate("hiredDetails.positionId", "positionName")
      .select("-__v");

    candidates = candidates.map((candidate) => {
      if (candidate.assessments) {
        candidate.assessments = candidate.assessments.map(
          updateAssessmentStatus
        );
      }

      if (candidate.interviews) {
        candidate.interviews = candidate.interviews.map(updateInterviewStatus);
      }

      const newStatus = determineOverallStatus(candidate);

      if (newStatus !== candidate.currentStatus) {
        candidate.currentStatus = newStatus;
        candidate.save();
      }

      return candidate;
    });

    res.status(200).json({ success: true, data: candidates });
  } catch (error) {
    handleError(res, error, "Failed to retrieve candidates");
  }
};

const getCandidateById = async (req, res) => {
  try {
    const candidateId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid candidate ID" });
    }

    let candidate = await Candidate.findById(candidateId)
      .populate("hiredDetails.positionId", "positionName")
      .select("-__v");

    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, error: "Candidate not found" });
    }

    if (candidate.assessments) {
      candidate.assessments = candidate.assessments.map(updateAssessmentStatus);
    }

    if (candidate.interviews) {
      candidate.interviews = candidate.interviews.map(updateInterviewStatus);
    }

    const newStatus = determineOverallStatus(candidate);

    if (newStatus !== candidate.currentStatus) {
      candidate.currentStatus = newStatus;
      await candidate.save();
    }

    res.status(200).json({ success: true, data: candidate });
  } catch (error) {
    handleError(res, error, "Failed to retrieve candidate");
  }
};

const createCandidate = async (req, res) => {
  try {
    if (!req.body.fullName || !req.body.email) {
      return res
        .status(400)
        .json({ success: false, error: "Full name and email are required" });
    }

    const candidate = new Candidate({
      fullName: req.body.fullName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      appliedPosition: req.body.appliedPosition,
      level: req.body.level,
      experience: req.body.experience,
      educationBackground: req.body.educationBackground,
      skills: req.body.skills,
      source: req.body.source,
      notes: req.body.notes,
    });
    const savedCandidate = await candidate.save();

    res.status(201).json({
      success: true,
      data: savedCandidate,
      message: "Candidate created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, error: "Email already exists" });
    }
    handleError(res, error, "Failed to create candidate");
  }
};

const updateCandidate = async (req, res) => {
  try {
    const candidateId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid candidate ID" });
    }

    const candidate = await Candidate.findByIdAndUpdate(candidateId, req.body, {
      new: true,
      runValidators: true,
    }).select("-__v");

    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, error: "Candidate not found" });
    }

    res.status(200).json({
      success: true,
      data: candidate,
      message: "Candidate updated successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, error: "Email already exists" });
    }
    handleError(res, error, "Failed to update candidate");
  }
};

const deleteCandidate = async (req, res) => {
  try {
    const candidateId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid candidate ID" });
    }

    const candidate = await Candidate.findByIdAndDelete(candidateId).select(
      "-__v"
    );

    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, error: "Candidate not found" });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: "Candidate deleted successfully",
    });
  } catch (error) {
    handleError(res, error, "Failed to delete candidate");
  }
};

const addAssessmentToCandidate = async (req, res) => {
  try {
    const candidateId = req.params.candidateId;
    const { assessmentId } = req.body;
    const { assignedEvaluatorId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(candidateId) ||
      !mongoose.Types.ObjectId.isValid(assessmentId)
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid candidate or assessment ID" });
    }

    const candidate = await Candidate.findById(candidateId);
    const assessment = await Assessment.findById(assessmentId);
    const user = await User.findById(assignedEvaluatorId);

    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, error: "Candidate not found" });
    }
    if (!assessment) {
      return res
        .status(404)
        .json({ success: false, error: "Assessment not found" });
    }
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const { canSchedule, reason } = canScheduleAssessment(candidate);
    if (!canSchedule) {
      return res.status(400).json({ success: false, error: reason });
    }

    const assessmentExists = candidate.assessments.some(
      (a) => a.assessmentId.toString() === assessmentId
    );
    if (assessmentExists) {
      return res.status(400).json({
        success: false,
        error: "Assessment already added to candidate",
      });
    }

    const nextSequence =
      candidate.assessments.length > 0
        ? Math.max(...candidate.assessments.map((a) => a.sequence)) + 1
        : 1;

    const newAssessment = {
      assessmentId: assessmentId,
      assessmentName: assessment.assessmentName,
      scheduledDate: req.body.scheduledDate,
      assignedEvaluatorId: assignedEvaluatorId,
      sequence: nextSequence,
      maxScore: assessment.maxScore,
      evaluatedBy: user.fullName,
      status: "Scheduled",
    };

    candidate.assessments.push(newAssessment);
    candidate.currentStatus = "Assessment Scheduled";
    const updatedCandidate = await candidate.save();
    console.log(updatedCandidate);

    res.status(200).json({
      success: true,
      data: updatedCandidate,
      message: "Assessment added to candidate",
    });
  } catch (error) {
    handleError(res, error, "Failed to add assessment to candidate");
  }
};

const completeCandidateAssessment = async (req, res) => {
  try {
    const { candidateId, assessmentId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(candidateId) ||
      !mongoose.Types.ObjectId.isValid(assessmentId)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid candidate or assessment ID",
      });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: "Candidate not found",
      });
    }

    const assessmentToComplete = candidate.assessments.find(
      (a) => a.assessmentId.toString() === assessmentId
    );

    if (!assessmentToComplete) {
      return res.status(404).json({
        success: false,
        error: "Assessment not found for this candidate",
      });
    }

    if (assessmentToComplete.status === "Completed") {
      return res.status(400).json({
        success: false,
        error: "Assessment is already marked as completed",
      });
    }

    assessmentToComplete.status = "Completed";
    assessmentToComplete.completionDate = new Date();

    candidate.currentStatus = determineOverallStatus(candidate);

    const updatedCandidate = await candidate.save();

    const responseData = {
      _id: updatedCandidate._id,
      fullName: updatedCandidate.fullName,
      currentStatus: "Completed",
      assessment: updatedCandidate.assessments.find(
        (a) => a.assessmentId.toString() === assessmentId
      ),
    };

    res.status(200).json({
      success: true,
      data: updatedCandidate,
      message: "Assessment marked as completed successfully",
    });
  } catch (error) {
    console.error("Error completing assessment:", error);
    handleError(res, error, "Failed to mark assessment as completed");
  }
};

const updateCandidateAssessment = async (req, res) => {
  try {
    const { candidateId, assessmentId } = req.params;
    const { score, remarks } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(candidateId) ||
      !mongoose.Types.ObjectId.isValid(assessmentId)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid candidate or assessment ID",
      });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: "Candidate not found",
      });
    }

    if (candidate.currentStatus === "Rejected") {
      return res.status(400).json({
        success: false,
        error: "Cannot update assessment for rejected candidate",
      });
    }

    const assessmentToUpdate = candidate.assessments.find(
      (a) => a.assessmentId.toString() === assessmentId
    );

    if (!assessmentToUpdate) {
      return res.status(404).json({
        success: false,
        error: "Assessment not found for this candidate",
      });
    }

    let shouldUpdateCandidateStatus = false;
    const originalAssessmentStatus = assessmentToUpdate.status;

    if (score !== undefined && score !== null) {
      assessmentToUpdate.score = score;

      if (assessmentToUpdate.status === "Scheduled") {
        assessmentToUpdate.status = "In Progress";
        shouldUpdateCandidateStatus = true;
      }
    }

    if (remarks !== undefined && remarks !== null) {
      assessmentToUpdate.remarks = remarks;
    }

    if (
      (score !== undefined && score !== null) ||
      (remarks !== undefined && remarks !== null)
    ) {
      assessmentToUpdate.evaluationDate = new Date();
    }

    const hasScore =
      assessmentToUpdate.score !== undefined &&
      assessmentToUpdate.score !== null;
    const hasRemarks =
      assessmentToUpdate.remarks !== undefined &&
      assessmentToUpdate.remarks !== null;

    if (hasScore && hasRemarks && assessmentToUpdate.status !== "Evaluated") {
      assessmentToUpdate.status = "Evaluated";
      shouldUpdateCandidateStatus = true;
    }

    if (
      shouldUpdateCandidateStatus ||
      assessmentToUpdate.status !== originalAssessmentStatus
    ) {
      candidate.currentStatus = determineOverallStatus(candidate);
    }

    const updatedCandidate = await candidate.save();
    console.log(updatedCandidate);

    res.status(200).json({
      success: true,
      data: updatedCandidate,
      message: "Assessment updated successfully",
    });
  } catch (error) {
    console.error("Error updating assessment:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Duplicate assessment entry detected",
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error occurred while updating assessment",
    });
  }
};

const addInterviewToCandidate = async (req, res) => {
  try {
    const candidateId = req.params.candidateId;
    const { interviewId } = req.body;
    const { assignedEvaluatorId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(candidateId) ||
      !mongoose.Types.ObjectId.isValid(interviewId)
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid candidate or interview ID" });
    }

    const candidate = await Candidate.findById(candidateId);
    const interview = await Interview.findById(interviewId);
    const user = await User.findById(assignedEvaluatorId);

    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, error: "Candidate not found" });
    }
    if (!interview) {
      return res
        .status(404)
        .json({ success: false, error: "Interview not found" });
    }
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "Interviewer not found" });
    }

    const { canSchedule, reason } = canScheduleInterview(candidate);
    if (!canSchedule) {
      return res.status(400).json({ success: false, error: reason });
    }

    const interviewExists = candidate.interviews.some(
      (i) => i.interviewId.toString() === interviewId
    );
    if (interviewExists) {
      return res.status(400).json({
        success: false,
        error: "Interview already added to candidate",
      });
    }

    const nextSequence =
      candidate.interviews.length > 0
        ? Math.max(...candidate.interviews.map((i) => i.sequence)) + 1
        : 1;

    const newInterview = {
      interviewId: interviewId,
      interviewName: interview.interviewName,
      interviewType: interview.mode,
      assignedEvaluatorId: assignedEvaluatorId,
      interviewerName: user.fullName,
      scheduledDatetime: req.body.scheduledDatetime,
      interviewLocation: req.body.interviewLocation,
      sequence: nextSequence,
      status: "Scheduled",
    };

    candidate.interviews.push(newInterview);
    candidate.currentStatus = "Interview Scheduled";
    const updatedCandidate = await candidate.save();

    res.status(200).json({
      success: true,
      data: updatedCandidate,
      message: "Interview added to candidate",
    });
  } catch (error) {
    handleError(res, error, "Failed to add interview to candidate");
  }
};

const completeCandidateInterview = async (req, res) => {
  try {
    const { candidateId, interviewId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(candidateId) ||
      !mongoose.Types.ObjectId.isValid(interviewId)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid candidate or interview ID",
      });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: "Candidate not found",
      });
    }

    if (candidate.currentStatus === "Rejected") {
      return res.status(400).json({
        success: false,
        error: "Cannot update interview for rejected candidate",
      });
    }

    const interviewToComplete = candidate.interviews.find(
      (i) => i.interviewId.toString() === interviewId
    );

    if (!interviewToComplete) {
      return res.status(404).json({
        success: false,
        error: "Interview not found for this candidate",
      });
    }

    if (interviewToComplete.status === "Completed") {
      return res.status(400).json({
        success: false,
        error: "Interview is already marked as completed",
      });
    }

    interviewToComplete.status = "Completed";
    interviewToComplete.completionDate = new Date();

    candidate.currentStatus = determineOverallStatus(candidate);

    const updatedCandidate = await candidate.save();

    res.status(200).json({
      success: true,
      data: updatedCandidate,
      message: "Interview marked as completed successfully",
    });
  } catch (error) {
    console.error("Error completing interview:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error occurred while completing interview",
    });
  }
};

const updateCandidateInterview = async (req, res) => {
  try {
    const { candidateId, interviewId } = req.params;
    const { score, remarks } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(candidateId) ||
      !mongoose.Types.ObjectId.isValid(interviewId)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid candidate or interview ID",
      });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: "Candidate not found",
      });
    }

    if (candidate.currentStatus === "Rejected") {
      return res.status(400).json({
        success: false,
        error: "Cannot update interview for rejected candidate",
      });
    }

    const interviewToUpdate = candidate.interviews.find(
      (i) => i.interviewId.toString() === interviewId
    );

    if (!interviewToUpdate) {
      return res.status(404).json({
        success: false,
        error: "Interview not found for this candidate",
      });
    }

    let interviewUpdated = false;

    if (score !== undefined && score !== null) {
      interviewToUpdate.score = score;
      if (interviewToUpdate.status === "Scheduled") {
        interviewToUpdate.status = "In Progress";
        interviewUpdated = true;
      }
    }

    if (remarks !== undefined && remarks !== null) {
      interviewToUpdate.remarks = remarks;
    }

    if (
      (score !== undefined && score !== null) ||
      (remarks !== undefined && remarks !== null)
    ) {
      interviewToUpdate.conductedDate = new Date();
    }

    const hasScore =
      interviewToUpdate.score !== undefined && interviewToUpdate.score !== null;
    const hasRemarks =
      interviewToUpdate.remarks !== undefined &&
      interviewToUpdate.remarks !== null;

    if (hasScore && hasRemarks) {
      interviewToUpdate.status = "Evaluated";
      interviewUpdated = true;
    }

    if (interviewUpdated) {
      candidate.currentStatus = determineOverallStatus(candidate);
    }

    const updatedCandidate = await candidate.save();

    res.status(200).json({
      success: true,
      data: updatedCandidate,
      message: "Interview updated successfully",
    });
  } catch (error) {
    console.error("Error updating interview:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Duplicate interview entry detected",
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error occurred while updating interview",
    });
  }
};

const updateCandidateStatus = async (req, res) => {
  try {
    const candidateId = req.params.id;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid candidate ID" });
    }

    const validStatuses = Candidate.schema.path("currentStatus").enumValues;
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status: ${status}.  Valid statuses are: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    const candidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { currentStatus: status },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, error: "Candidate not found" });
    }

    res.status(200).json({
      success: true,
      data: candidate,
      message: "Candidate status updated",
    });
  } catch (error) {
    handleError(res, error, "Failed to update candidate status");
  }
};

const makeOffer = async (req, res) => {
  try {
    const candidateId = req.params.candidateId;
    const { offeredPositionId, salary, benefits } = req.body;

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid candidate ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(offeredPositionId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid position ID" });
    }

    const candidate = await Candidate.findById(candidateId);
    const position = await Position.findById(offeredPositionId);

    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, error: "Candidate not found" });
    }
    if (!position) {
      return res
        .status(404)
        .json({ success: false, error: "Position not found" });
    }

    if (candidate.offer && candidate.offer.offerId) {
      return res.status(400).json({
        success: false,
        error: "Offer already exists for this candidate",
      });
    }

    const offerData = {
      offerId: new mongoose.Types.ObjectId(),
      offeredPositionId,
      offeredPositionName: position.positionName,
      offerDate: new Date(),
      salary,
      benefits,
      offerStatus: "Pending",
    };

    candidate.offer = offerData;
    candidate.currentStatus = "Offer Extended";
    const updatedCandidate = await candidate.save();

    res.status(200).json({
      success: true,
      data: updatedCandidate,
      message: "Offer made to candidate",
    });
  } catch (error) {
    handleError(res, error, "Failed to make offer");
  }
};

const updateOfferStatus = async (req, res) => {
  try {
    const candidateId = req.params.candidateId;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid candidate ID" });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, error: "Candidate not found" });
    }

    if (!candidate.offer || !candidate.offer.offerId) {
      return res
        .status(400)
        .json({ success: false, error: "No offer found for this candidate" });
    }
    const validStatuses = ["Pending", "Accepted", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid offer status: ${status}. Valid statuses are: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    candidate.offer.offerStatus = status;
    let newStatus = "Offer Extended";
    if (status === "Accepted") {
      candidate.offer.acceptanceDate = new Date();
      newStatus = "Offer Accepted";
    } else if (status === "Rejected") {
      candidate.offer.rejectionDate = new Date();
      newStatus = "Rejected";
    }
    candidate.currentStatus = newStatus;
    const updatedCandidate = await candidate.save();

    res.status(200).json({
      success: true,
      data: updatedCandidate,
      message: "Offer status updated",
    });
  } catch (error) {
    handleError(res, error, "Failed to update offer status");
  }
};

const hireCandidate = async (req, res) => {
  try {
    const candidateId = req.params.candidateId;
    const { positionId, agreedSalary } = req.body;

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid candidate ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(positionId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid position ID" });
    }

    const candidate = await Candidate.findById(candidateId);
    const position = await Position.findById(positionId);
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, error: "Candidate not found" });
    }
    if (!position) {
      return res
        .status(404)
        .json({ success: false, error: "Position not found" });
    }
    if (candidate.currentStatus === "Hired") {
      return res
        .status(400)
        .json({ success: false, error: "Candidate is already hired" });
    }

    const hiredDetails = {
      hiredId: new mongoose.Types.ObjectId(),
      positionId: positionId,
      positionName: position.positionName,
      hiringDate: new Date(),
      startDate: req.body.startDate,
      agreedSalary,
    };

    candidate.hiredDetails = hiredDetails;
    candidate.currentStatus = "Hired";
    const updatedCandidate = await candidate.save();

    res.status(200).json({
      success: true,
      data: updatedCandidate,
      message: "Candidate hired",
    });
  } catch (error) {
    handleError(res, error, "Failed to hire candidate");
  }
};

const rejectCandidate = async (req, res) => {
  try {
    const candidateId = req.params.candidateId;
    const { rejectionReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid candidate ID" });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, error: "Candidate not found" });
    }
    if (candidate.currentStatus === "Hired") {
      return res
        .status(400)
        .json({ success: false, error: "Cannot reject a hired candidate" });
    }

    const rejectionDetails = {
      rejectedBy: req.candidateId,
      rejectionReason: rejectionReason,
      rejectionDate: new Date(),
    };

    candidate.assessments.forEach((a) => {
      if (a.status === "Scheduled" || a.status === "In Progress") {
        a.status = "Cancelled";
      }
    });

    candidate.interviews.forEach((i) => {
      if (i.status === "Scheduled" || i.status === "In Progress") {
        i.status = "Cancelled";
      }
    });

    candidate.rejectionDetails = rejectionDetails;
    candidate.currentStatus = "Rejected";
    const updatedCandidate = await candidate.save();

    res.status(200).json({
      success: true,
      data: updatedCandidate,
      message: "Candidate rejected",
    });
  } catch (error) {
    handleError(res, error, "Failed to reject candidate");
  }
};

module.exports = {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  addAssessmentToCandidate,
  completeCandidateAssessment,
  updateCandidateAssessment,
  addInterviewToCandidate,
  completeCandidateInterview,
  updateCandidateInterview,
  updateCandidateStatus,
  makeOffer,
  updateOfferStatus,
  hireCandidate,
  rejectCandidate,
};
