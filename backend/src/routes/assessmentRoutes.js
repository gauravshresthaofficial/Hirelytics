const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/authMiddleware");

const {
  getAllAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
} = require("../controllers/assessmentController");

router.get(
  "/",
  protect,
  authorize("admin", "hr", "evaluator"),
  getAllAssessments
);
router.get(
  "/:id",
  protect,
  authorize("admin", "hr", "evaluator"),
  getAssessmentById
);
router.post("/", protect, authorize("admin", "hr"), createAssessment);
router.put("/:id", protect, authorize("admin", "hr"), updateAssessment);
router.delete("/:id", protect, authorize("admin", "hr"), deleteAssessment);

module.exports = router;
