const express = require("express");

const {
  createPrediction,
  getPredictions,
  getPredictionStatus,
} = require("../controllers/predictionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createPrediction);
router.get("/", protect, getPredictions);
router.get("/status", protect, getPredictionStatus);

module.exports = router;