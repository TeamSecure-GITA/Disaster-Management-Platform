const express = require("express");
const router = express.Router();
const nerService = require("../services/nerLandslideService");

// GET /api/ner/overview - Full NER landslide intelligence overview
router.get("/overview", async (req, res, next) => {
  try {
    const data = await nerService.getOverview();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/ner/corridors - Road connectivity and blockage tracking
router.get("/corridors", async (req, res, next) => {
  try {
    const data = await nerService.getCorridors();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

// POST /api/ner/calculate-lsi - On-the-fly Landslide Susceptibility Index calculation
router.post("/calculate-lsi", async (req, res, next) => {
  try {
    const { rainfall24h, threshold, soilSaturation, slopeAngle, historicalEvents } = req.body;
    const result = nerService.calculateLSI({
      rainfall24h: Number(rainfall24h) || 50,
      threshold: Number(threshold) || 100,
      soilSaturation: Number(soilSaturation) || 50,
      slopeAngle: Number(slopeAngle) || 30,
      historicalEvents: Number(historicalEvents) || 2
    });
    res.status(200).json({ success: true, result });
  } catch (error) {
    next(error);
  }
});

// POST /api/ner/report-crack - Field reporting for slope cracks, soil slippage & road blockages
router.post("/report-crack", async (req, res, next) => {
  try {
    const result = await nerService.recordFieldObservation(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
