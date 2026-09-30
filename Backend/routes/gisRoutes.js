/**
 * gisRoutes.js  –  GIS / mapping API endpoints
 *
 * All endpoints return GeoJSON FeatureCollections (RFC 7946)
 * consumable directly by Leaflet L.geoJSON() / react-leaflet.
 *
 * Public routes (no auth) – intentional: maps must work for unauthenticated citizens.
 * Write routes require auth + admin/operator role.
 *
 *   GET  /api/gis/heatmap          – Risk heatmap GeoJSON (zones + incidents + model)
 *   GET  /api/gis/roads            – Road segment status GeoJSON
 *   GET  /api/gis/roads/:id/status – Single road status
 *   PATCH /api/gis/roads/:id       – Update road status (operator only)
 *   GET  /api/gis/layers           – GIS feature layers (infra, villages, etc.)
 *   GET  /api/gis/layers/:type     – Single layer type GeoJSON
 *   POST /api/gis/layers           – Add GIS feature (operator only)
 *   GET  /api/gis/summary          – Quick dashboard summary (zone counts, road status)
 *   POST /api/gis/sync             – Trigger road/inventory sync (admin only)
 */

"use strict";

const express = require("express");
const router  = express.Router();

const { protect }        = require("../middleware/authMiddleware");
const { operationsOnly } = require("../middleware/adminMiddleware");
const gisService         = require("../services/gisService");
const RoadSegment        = require("../models/RoadSegment");
const GisLayer           = require("../models/GisLayer");

// ---------------------------------------------------------------------------
// HEATMAP
// ---------------------------------------------------------------------------

/**
 * GET /api/gis/heatmap
 * Query params: state, hazard, minScore
 * Returns: GeoJSON FeatureCollection (risk zones + incidents)
 */
router.get("/heatmap", async (req, res, next) => {
  try {
    const { state, hazard, minScore } = req.query;
    const geojson = await gisService.getRiskHeatmapGeoJSON({ state, hazard, minScore });
    res.set("Cache-Control", "public, max-age=60");
    res.status(200).json(geojson);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// ROAD SEGMENTS
// ---------------------------------------------------------------------------

/**
 * GET /api/gis/roads
 * Query params: state, status, hazard, evacuationOnly
 * Returns: GeoJSON FeatureCollection (LineStrings with status properties)
 */
router.get("/roads", async (req, res, next) => {
  try {
    const { state, status, hazard, evacuationOnly } = req.query;
    const geojson = await gisService.getRoadSegmentsGeoJSON({ state, status, hazard, evacuationOnly });
    res.set("Cache-Control", "public, max-age=30");
    res.status(200).json(geojson);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/gis/roads/:id/status
 */
router.get("/roads/:id/status", async (req, res, next) => {
  try {
    const segment = await RoadSegment.findById(req.params.id).lean();
    if (!segment) return res.status(404).json({ success: false, message: "Road segment not found" });
    res.status(200).json({
      success: true,
      data: {
        id:             segment._id,
        name:           segment.name,
        status:         segment.status,
        riskScore:      segment.riskScore,
        hazardType:     segment.hazardType,
        statusNote:     segment.statusNote,
        statusSource:   segment.statusSource,
        statusUpdatedAt: segment.statusUpdatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/gis/roads/:id  – Update road status (operator only)
 * Body: { status, statusNote, riskScore, statusSource }
 */
router.patch("/roads/:id", protect, operationsOnly, async (req, res, next) => {
  try {
    const { status, statusNote, riskScore, statusSource } = req.body;
    const allowed = ["open", "restricted", "blocked", "unknown"];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `status must be one of ${allowed.join(", ")}` });
    }

    const segment = await RoadSegment.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(status       ? { status }       : {}),
          ...(statusNote   ? { statusNote }   : {}),
          ...(riskScore !== undefined ? { riskScore: Number(riskScore) } : {}),
          ...(statusSource ? { statusSource } : {}),
          statusUpdatedAt: new Date(),
        },
      },
      { new: true }
    );
    if (!segment) return res.status(404).json({ success: false, message: "Road segment not found" });
    res.status(200).json({ success: true, data: segment });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GIS FEATURE LAYERS (villages, infrastructure, landslide zones, etc.)
// ---------------------------------------------------------------------------

/**
 * GET /api/gis/layers
 * Query: layerType, state, district, minScore
 */
router.get("/layers", async (req, res, next) => {
  try {
    const { layerType, state, district, minScore } = req.query;
    const geojson = await gisService.getLayerGeoJSON({ layerType, state, district, minScore });
    res.set("Cache-Control", "public, max-age=120");
    res.status(200).json(geojson);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/gis/layers/:type
 * Shorthand: /api/gis/layers/infrastructure  etc.
 */
router.get("/layers/:type", async (req, res, next) => {
  try {
    const { state, district, minScore } = req.query;
    const geojson = await gisService.getLayerGeoJSON({
      layerType: req.params.type,
      state,
      district,
      minScore,
    });
    res.set("Cache-Control", "public, max-age=120");
    res.status(200).json(geojson);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/gis/layers – add/update a GIS feature (operator only)
 * Body: { layerType, name, state, district, geometry, properties, riskScore, hazardType, source }
 */
router.post("/layers", protect, operationsOnly, async (req, res, next) => {
  try {
    const {
      layerType, name, state, district,
      geometry, properties, riskScore, hazardType, source,
    } = req.body;

    if (!layerType || !name || !geometry) {
      return res.status(400).json({ success: false, message: "layerType, name and geometry are required" });
    }

    const feature = await GisLayer.create({
      layerType, name, state, district,
      geometry, properties: properties || {},
      riskScore: riskScore || null,
      hazardType: hazardType || null,
      source: source || "manual",
    });

    res.status(201).json({ success: true, data: feature });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------

const mongoose = require("mongoose");

/**
 * GET /api/gis/summary
 * Quick stats for dashboard cards
 */
router.get("/summary", async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    let totalRoads = gisService.NER_CORRIDOR_SEED.length;
    let blockedRoads = gisService.NER_CORRIDOR_SEED.filter((s) => s.status === "blocked").length;
    let restrictedRoads = gisService.NER_CORRIDOR_SEED.filter((s) => s.status === "restricted").length;
    let infraCount = gisService.INFRA_SEED.length;
    let villageCount = gisService.VILLAGE_SEED.length;

    const riskSummary = await gisService.getRiskHeatmapGeoJSON();

    if (isDbConnected) {
      try {
        const counts = await Promise.all([
          RoadSegment.countDocuments(),
          RoadSegment.countDocuments({ status: "blocked" }),
          RoadSegment.countDocuments({ status: "restricted" }),
          GisLayer.countDocuments({ layerType: "infrastructure", isActive: true }),
          GisLayer.countDocuments({ layerType: "village", isActive: true }),
        ]);
        if (counts[0] > 0) {
          totalRoads = counts[0];
          blockedRoads = counts[1];
          restrictedRoads = counts[2];
          infraCount = counts[3];
          villageCount = counts[4];
        }
      } catch (_e) {}
    }

    res.status(200).json({
      success: true,
      data: {
        riskZones:          riskSummary.summary?.zones || 0,
        activeIncidents:    riskSummary.summary?.incidents || 0,
        modelRiskHotspots:  riskSummary.summary?.modelOutputs || 0,
        totalRoadSegments:  totalRoads,
        blockedRoads,
        restrictedRoads,
        openRoads:          totalRoads - blockedRoads - restrictedRoads,
        infrastructureFeatures: infraCount,
        villageFeatures:    villageCount,
        generatedAt:        new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// SYNC
// ---------------------------------------------------------------------------

/**
 * POST /api/gis/sync  – force sync road corridors from nerLandslideService
 */
router.post("/sync", protect, operationsOnly, async (req, res, next) => {
  try {
    const result = await gisService.syncRoadStatusFromNer();
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
