const express = require("express");
const router = express.Router();
const terrainController = require("../controllers/terrainController");

// GET /api/terrain/point - Derive slope, aspect, curvature, elevation, distance to roads & streams from DEM
router.get("/point", terrainController.getPointTerrain);

// GET /api/terrain/grid - Grid cell GeoJSON over a bounding box with DEM indices
router.get("/grid", terrainController.getGridTerrain);

// GET /api/terrain/corridor/:corridorId - Longitudinal DEM elevation & slope profile for highway alignments
router.get("/corridor/:corridorId", terrainController.getCorridorProfile);

// POST /api/terrain/calculate-lsi - Multi-factor Landslide Susceptibility Index calculation
router.post("/calculate-lsi", terrainController.calculateEnhancedLSI);

// GET /api/terrain/sources - Metadata on DEM and thematic data sources
router.get("/sources", terrainController.getTerrainSources);

module.exports = router;
