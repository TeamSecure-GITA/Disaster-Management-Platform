const express = require("express");

const {
    submitIncident,
    listIncidents,
    listMyIncidents,
    listNearbyIncidents,
    getHeatmapData,
    fetchIncidentById,
    patchIncidentStatus,
} = require("../controllers/incidentController");

const { protect } = require("../middleware/authMiddleware");
const { operationsOnly } = require("../middleware/adminMiddleware");
const { uploadLimiter } = require("../middleware/rateLimitMiddleware");
const { mixedMediaUpload } = require("../middleware/uploadMiddleware");

const router = express.Router();

// All incident routes require authentication
router.use(protect);

// ── Reporting ─────────────────────────────────────────────────────────────────

// POST /api/incidents
// Submit a geo-tagged field incident report with up to 5 media files
router.post(
    "/",
    uploadLimiter,
    mixedMediaUpload.array("media", 5),
    submitIncident
);

// ── Read — own reports ────────────────────────────────────────────────────────

// GET /api/incidents/mine
// Authenticated user's own reports (must be before /:id to avoid param clash)
router.get("/mine", listMyIncidents);

// ── Spatial / GIS ─────────────────────────────────────────────────────────────

// GET /api/incidents/nearby?lat=&lng=&radius=
// Active incidents near a GPS coordinate (2dsphere $near query)
router.get("/nearby", listNearbyIncidents);

// GET /api/incidents/heatmap?incidentType=&severity=&from=&to=
// GeoJSON FeatureCollection for Leaflet / Mapbox heatmap layer
router.get("/heatmap", getHeatmapData);

// ── Admin / Operator ──────────────────────────────────────────────────────────

// GET /api/incidents
// All reports, paginated + filtered (admin/operator only)
router.get("/", operationsOnly, listIncidents);

// ── Single record ─────────────────────────────────────────────────────────────

// GET /api/incidents/:id
// Owner or admin/operator can view a specific report
router.get("/:id", fetchIncidentById);

// PATCH /api/incidents/:id/status
// Admin/operator: verify, escalate, resolve, or reject
router.patch("/:id/status", operationsOnly, patchIncidentStatus);

module.exports = router;
