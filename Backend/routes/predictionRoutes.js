const express = require("express");

const {
  createPrediction,
  getPredictions,
  getPredictionStatus,
} = require("../controllers/predictionController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const {
  predictionValidator,
  predictionQueryValidator,
} = require("../validators/predictionValidator");

const router = express.Router();

router.post("/", protect, predictionValidator, validate, createPrediction);
router.get("/", protect, predictionQueryValidator, validate, getPredictions);
router.get("/status", protect, getPredictionStatus);

module.exports = router;