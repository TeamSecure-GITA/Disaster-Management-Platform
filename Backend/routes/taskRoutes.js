const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { operationsOnly } = require("../middleware/adminMiddleware");

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
} = require("../controllers/taskController");

const router = express.Router();

router.post("/", protect, operationsOnly, createTask);

router.get("/", getTasks);

router.get("/:id", getTaskById);

router.put("/:id", protect, operationsOnly, updateTask);

module.exports = router;