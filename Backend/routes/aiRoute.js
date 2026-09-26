const express = require("express");
const {
  chat,
  predict,
  analyzeImage,
  getLandslidePredictions,
  getForecast,
  getModelPerformance,
  getAiStatus,
  getSituationBrief,
  runSimulation,
  getAnalyticsKpis,
  getIncidentTrends,
  getResourceAllocations,
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

// Real-time disaster situation brief
router.get("/situation-brief", getSituationBrief);

// Scenario simulation
router.post("/simulation/run", runSimulation);

// Model KPI and operational analytics
router.get("/analytics/model-performance", getModelPerformance);
router.get("/analytics/kpis", getAnalyticsKpis);
router.get("/analytics/incident-trends", getIncidentTrends);
router.get("/analytics/resources", getResourceAllocations);

// Live AI / ML bridge status
router.get("/status", getAiStatus);

module.exports = router;
