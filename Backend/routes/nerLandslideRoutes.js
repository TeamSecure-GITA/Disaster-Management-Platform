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

// POST /api/ner/calculate-lsi - On-the-fly Landslide Susceptibility Index calculation with DEM support
router.post("/calculate-lsi", async (req, res, next) => {
  try {
    const { rainfall24h, threshold, soilSaturation, slopeAngle, historicalEvents, lat, lng } = req.body;
    let terrain = null;

    if (lat !== undefined && lng !== undefined) {
      try {
        const terrainService = require("../services/terrainService");
        terrain = await terrainService.getTerrainAtCoordinates(Number(lat), Number(lng));
      } catch (err) {}
    }

    const result = nerService.calculateLSI({
      rainfall24h: Number(rainfall24h) || 50,
      threshold: Number(threshold) || 100,
      soilSaturation: Number(soilSaturation) || 50,
      slopeAngle: slopeAngle !== undefined && slopeAngle !== null ? Number(slopeAngle) : (terrain ? terrain.slopeDeg : 30),
      historicalEvents: Number(historicalEvents) || 2,
      terrain,
    });

    res.status(200).json({
      success: true,
      result: {
        ...result,
        demDerived: Boolean(terrain),
        derivedTerrain: terrain ? {
          elevationMeters: terrain.elevationMeters,
          slopeDeg: terrain.slopeDeg,
          aspectDirection: terrain.aspectDirection,
          curvature: terrain.curvature,
          distanceToRoadsMeters: terrain.distanceToRoadsMeters,
          distanceToStreamsMeters: terrain.distanceToStreamsMeters,
          lithology: terrain.lithology.formation,
          demSource: terrain.demSource,
        } : null,
      },
    });
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
