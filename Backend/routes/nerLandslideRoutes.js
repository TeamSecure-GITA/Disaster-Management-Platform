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

// GET /api/ner/districts - Monitored district-level drill-down data with computed telemetry
router.get("/districts", async (req, res, next) => {
  try {
    const { state } = req.query;
    const districts = nerService.getDistricts(state);
    res.status(200).json({
      success: true,
      count: districts.length,
      state: state || "All NER",
      districts,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/ner/inventory - Query geocoded historical landslide inventory (NASA GLC, GSI, BRO, SDMA)
router.get("/inventory", async (req, res, next) => {
  try {
    const { state, source, highway, fatalOnly, limit } = req.query;
    const result = nerService.getInventory({
      state,
      source,
      highway,
      fatalOnly: fatalOnly === "true",
      limit: limit ? Number(limit) : undefined,
    });
    res.status(200).json({
      success: true,
      count: result.events ? result.events.length : 0,
      inventory: result.events || [],
      catalogs: result.catalogs,
      totalRecords: result.totalRecords,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/ner/inventory/stats - Aggregate stats of historical records across NER
router.get("/inventory/stats", async (req, res, next) => {
  try {
    const stats = nerService.getInventoryStats();
    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/ner/field-observations - Retrieve geocoded field crack observations
router.get("/field-observations", async (req, res, next) => {
  try {
    const { state } = req.query;
    const observations = nerService.getFieldObservations(state);
    res.status(200).json({
      success: true,
      count: observations.length,
      observations,
    });
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
      historicalEvents: historicalEvents !== undefined && historicalEvents !== null ? Number(historicalEvents) : null,
      lat: lat !== undefined ? Number(lat) : undefined,
      lng: lng !== undefined ? Number(lng) : undefined,
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
          lithology: terrain.lithology ? terrain.lithology.formation : null,
          demSource: terrain.demSource,
        } : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

const { optionalAuth } = require("../middleware/authMiddleware");

// POST /api/ner/report-crack - Field reporting for slope cracks, soil slippage & road blockages
router.post("/report-crack", optionalAuth, async (req, res, next) => {
  try {
    // Role check: If user token is provided, verify role authorization
    if (req.user && req.user.role && !["citizen", "volunteer", "responder", "operator", "admin", "super_admin"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: role unauthorized to submit field observations.",
      });
    }

    const result = await nerService.recordFieldObservation(req.body, req.user);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
