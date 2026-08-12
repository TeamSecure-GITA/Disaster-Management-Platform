const express = require("express");

const {
  createPrediction,
  getPredictions,
} = require("../controllers/predictionController");

const router = express.Router();

router.post(
  "/",
  createPrediction
);

router.get(
  "/",
  getPredictions
);

module.exports = router;