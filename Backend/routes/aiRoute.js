const express = require("express");
const {
  chat,
  predict,
  analyzeImage,
  getLandslidePredictions,
  getForecast,
  getModelPerformance,
  getAiStatus,
} = require("../controllers/aiController");

const router = express.Router();

// Copilot conversational AI
router.post("/chat", chat);

// Universal prediction
router.post("/predict", predict);

// Multimodal structural damage assessment
router.post("/analyze-image", analyzeImage);

// Geotechnical & Meteorological forecasts
router.get("/predictions/landslide", getLandslidePredictions);
router.get("/predictions/forecast", getForecast);

// Model KPI and metrics
router.get("/analytics/model-performance", getModelPerformance);

// Live AI / ML bridge status
router.get("/status", getAiStatus);

module.exports = router;
