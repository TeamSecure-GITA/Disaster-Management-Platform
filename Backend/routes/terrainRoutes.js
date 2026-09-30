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

// GET /api/terrain/model-validation - Spatial cross-validation benchmark and lead-time report
router.get("/model-validation", terrainController.getModelValidation);

// POST /api/terrain/predict-grid-cells - Live inference per grid cell on live telemetry
router.post("/predict-grid-cells", terrainController.predictGridCells);

// POST /api/terrain/predict-road-segments - Live inference per road segment along transport corridors
router.post("/predict-road-segments", terrainController.predictRoadSegments);

module.exports = router;

