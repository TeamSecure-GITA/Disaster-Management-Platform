const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { operationsOnly } = require("../middleware/adminMiddleware");

const {
  createDisaster,
  getDisasters,
  getDisasterById,
  updateDisaster,
  deleteDisaster,
} = require("../controllers/disasterController");

const router = express.Router();

router.post("/", protect, operationsOnly, createDisaster);

router.get("/", getDisasters);

router.get("/:id", getDisasterById);

router.put("/:id", protect, operationsOnly, updateDisaster);

router.delete("/:id", protect, operationsOnly, deleteDisaster);

module.exports = router;