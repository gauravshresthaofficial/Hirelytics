const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/authMiddleware");

const {
  getAllInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
} = require("../controllers/interviewController");

router.get(
  "/",
  protect,
  authorize("admin", "hr", "evaluator"),
  getAllInterviews
);
router.get(
  "/:id",
  protect,
  authorize("admin", "hr", "evaluator"),
  getInterviewById
);
router.post("/", protect, authorize("admin", "hr"), createInterview);
router.put("/:id", protect, authorize("admin", "hr"), updateInterview);
router.delete("/:id", protect, authorize("admin", "hr"), deleteInterview);

module.exports = router;
