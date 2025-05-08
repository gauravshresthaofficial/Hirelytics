const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/authMiddleware");
const {
  getAllPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
} = require("../controllers/positionController");

router.get(
  "/",
  protect,
  authorize("admin", "hr", "evaluator"),
  getAllPositions
);

router.get(
  "/:id",
  protect,
  authorize("admin", "hr", "evaluator"),
  getPositionById
);

router.post("/", protect, authorize("admin", "hr"), createPosition);

router.put("/:id", protect, authorize("admin", "hr"), updatePosition);

router.delete("/:id", protect, authorize("admin", "hr"), deletePosition);

module.exports = router;
