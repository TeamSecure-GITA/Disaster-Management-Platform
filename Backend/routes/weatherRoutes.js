const express = require("express");
const router = express.Router();
const weatherController = require("../controllers/weatherController");

// GET /api/weather/current - Current weather conditions
router.get("/current", weatherController.getCurrentWeather);

// GET /api/weather/ner-rainfall - Live NER rolling rainfall across 8 states & corridors
router.get("/ner-rainfall", weatherController.getNerRainfall);

// GET /api/weather/rainfall-series - Time series telemetry for analytics and charts
router.get("/rainfall-series", weatherController.getRainfallTimeSeries);

// POST /api/weather/sync-now - On-demand trigger to ingest gridded rainfall
router.post("/sync-now", weatherController.syncWeatherData);

// GET /api/weather/imd-terms - Official IMD data-access terms & gap-filling framework
router.get("/imd-terms", weatherController.getImdTerms);

module.exports = router;
