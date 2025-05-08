const express = require("express");
const { protect, authorize } = require("../middlewares/authMiddleware");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
} = require("../controllers/userController");

const router = express.Router();

router.post("/", protect, authorize("admin", "hr"), createUser);
router.get("/", protect, authorize("admin", "hr", "evaluator"), getAllUsers);
router.put("/:id", protect, authorize("admin", "hr", "evaluator"), updateUser);
router.get("/:id", protect, authorize("admin", "hr", "evaluator"), getUserById);

module.exports = router;
