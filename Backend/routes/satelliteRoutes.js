const express = require("express");

const {
  saveSatelliteData,
  getSatelliteData,
  getSatelliteDataById,
  updateProcessingStatus,
  getSatelliteMapLayers,
  getInsarDisplacement,
  getSatelliteSummary,
  triggerSatelliteSync,
  getSatelliteSources,
  getRasterOverlay,
} = require("../controllers/satelliteController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/adminMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const {
  createSatelliteValidator,
  satelliteIdValidator,
  processingStatusValidator,
} = require("../validators/satelliteValidator");

const router = express.Router();

// ─── Public GIS Map Layer & Telemetry Endpoints ──────────────────────────────
router.get("/sources", getSatelliteSources);
router.get("/layers", getSatelliteMapLayers);
router.get("/layers/raster-overlay/:siteId", getRasterOverlay);
router.get("/insar-displacement", getInsarDisplacement);
router.get("/summary", getSatelliteSummary);

// ─── Protected Operations & Ingest Endpoints ─────────────────────────────────
router.use(protect);
const operationsOnly = allowRoles("admin", "operator");

router.post("/sync-now", operationsOnly, triggerSatelliteSync);
router.post("/", operationsOnly, createSatelliteValidator, validate, saveSatelliteData);

router.get("/", getSatelliteData);
router.get("/:id", satelliteIdValidator, validate, getSatelliteDataById);
router.patch("/:id/status", operationsOnly, processingStatusValidator, validate, updateProcessingStatus);

module.exports = router;