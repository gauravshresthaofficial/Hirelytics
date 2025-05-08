const express = require("express");
const router = express.Router();
const {
  getCandidatesByStatus,
  getCandidatesByPosition,
  getAssessmentResults,
  getInterviewResults,
  getCandidatesByStageCount,
  getEvaluatorList,
  getCandidatesByEvaluatorForAssessment,
  getCandidatesByEvaluatorForInterview,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middlewares/authMiddleware");
router.get(
  "/status/:status",
  protect,
  authorize("admin", "hr", "evaluator"),
  getCandidatesByStatus
);
router.get(
  "/position/:position",
  protect,
  authorize("admin", "hr", "evaluator"),
  getCandidatesByPosition
);
router.get(
  "/assessment/:assessmentId",
  protect,
  authorize("admin", "hr", "evaluator"),
  getAssessmentResults
);
router.get(
  "/interview/:interviewType",
  protect,
  authorize("admin", "hr", "evaluator"),
  getInterviewResults
);
router.get(
  "/stages",
  protect,
  authorize("admin", "hr", "evaluator"),
  getCandidatesByStageCount
);
router.get(
  "/evaluators",
  protect,
  authorize("admin", "hr", "evaluator"),
  getEvaluatorList
);
router.get(
  "/evaluator/:evaluatorId/assessments",
  protect,
  authorize("admin", "hr", "evaluator"),
  getCandidatesByEvaluatorForAssessment
);
router.get(
  "/evaluator/:evaluatorId/interviews",
  protect,
  authorize("admin", "hr", "evaluator"),
  getCandidatesByEvaluatorForInterview
);

module.exports = router;
