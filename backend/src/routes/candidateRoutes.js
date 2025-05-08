const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/authMiddleware");
const {
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
} = require("../controllers/candidateController");

// Define routes
router.get(
  "/",
  protect,
  authorize("admin", "hr", "evaluator"),
  getAllCandidates
);
router.get(
  "/:id",
  protect,
  authorize("admin", "hr", "evaluator"),
  getCandidateById
);
router.post("/", protect, authorize("admin", "hr"), createCandidate);
router.put("/:id", protect, authorize("admin", "hr"), updateCandidate);
router.delete("/:id", protect, authorize("admin", "hr"), deleteCandidate);

router.post(
  "/:candidateId/assessments",
  protect,
  authorize("admin", "hr"),
  addAssessmentToCandidate
);
router.put(
  "/:candidateId/assessments/:assessmentId",
  protect,
  authorize("evaluator", "admin"),
  updateCandidateAssessment
);
router.put(
  "/:candidateId/assessments/:assessmentId/complete",
  protect,
  authorize("evaluator", "admin"),
  completeCandidateAssessment
);

router.post(
  "/:candidateId/interviews",
  protect,
  authorize("admin", "hr"),
  addInterviewToCandidate
);
router.put(
  "/:candidateId/interviews/:interviewId",
  protect,
  authorize("evaluator", "admin"),
  updateCandidateInterview
);

router.put(
  "/:candidateId/interviews/:interviewId/complete",
  protect,
  authorize("evaluator", "admin"),
  completeCandidateInterview
);

router.put(
  "/:id/status",
  protect,
  authorize("admin", "hr", "evaluator"),
  updateCandidateStatus
);

router.post(
  "/:candidateId/offer",
  protect,
  authorize("admin", "hr"),
  makeOffer
);
router.put(
  "/:candidateId/offer",
  protect,
  authorize("admin", "hr"),
  updateOfferStatus
);

router.post(
  "/:candidateId/hire",
  protect,
  authorize("admin", "hr"),
  hireCandidate
);
router.post(
  "/:candidateId/reject",
  protect,
  authorize("admin", "hr"),
  rejectCandidate
);

module.exports = router;
