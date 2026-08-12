const express = require("express");

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
} = require("../controllers/taskController");

const router = express.Router();

router.post("/", createTask);

router.get("/", getTasks);

router.get("/:id", getTaskById);

router.put("/:id", updateTask);

module.exports = router;