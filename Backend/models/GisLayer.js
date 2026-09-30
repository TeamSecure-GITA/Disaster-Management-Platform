/**
 * GisLayer.js – GeoJSON feature store for village / infrastructure layers.
 *
 * Stores arbitrary GeoJSON features (Point, Polygon, LineString) tagged
 * by layer type so the map can fetch and render them independently.
 *
 * Layer types:
 *   village          – inhabited place centroids (census / Bhuvan)
 *   infrastructure   – hospitals, shelters, control rooms, towers, dams
 *   landslide_zone   – historical landslide polygon inventory
 *   risk_heatmap     – model-output risk point / polygon
 *   road_segment     – (use RoadSegment model instead; this is for other linear infra)
 *   admin_boundary   – district / sub-district polygons
 */
"use strict";

const mongoose = require("mongoose");

const gisLayerSchema = new mongoose.Schema(
  {
    layerType: {
      type: String,
      enum: [
        "village",
        "infrastructure",
        "landslide_zone",
        "risk_heatmap",
        "admin_boundary",
        "evacuation_route",
      ],
      required: true,
      index: true,
    },

    /** Feature name (for popup display) */
    name: { type: String, required: true, trim: true },

    state: { type: String, trim: true, index: true },
    district: { type: String, trim: true, index: true },

    /**
     * GeoJSON geometry – supports Point, Polygon, LineString
     */
    geometry: {
      type: {
        type: String,
        enum: ["Point", "Polygon", "LineString", "MultiPolygon"],
        required: true,
      },
      coordinates: { type: mongoose.Schema.Types.Mixed, required: true },
    },

    /** Arbitrary key-value properties (rendered in map popup) */
    properties: { type: mongoose.Schema.Types.Mixed, default: {} },

    /** 0–100 risk / priority score (used for heatmap intensity) */
    riskScore: { type: Number, default: null, min: 0, max: 100 },

    /** E.g. "landslide", "flood", "cyclone" */
    hazardType: { type: String, default: null },

    /** Data source for attribution */
    source: {
      type: String,
      enum: [
        "census",
        "bhuvan",
        "ndma",
        "nasa_glc",
        "gsi",
        "bro",
        "state_gis",
        "model",
        "manual",
        "overture_maps",
      ],
      default: "manual",
    },

    /** True if the feature is currently active / visible */
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Geospatial index on geometry
gisLayerSchema.index({ geometry: "2dsphere" });
gisLayerSchema.index({ layerType: 1, isActive: 1 });
gisLayerSchema.index({ state: 1, layerType: 1 });
gisLayerSchema.index({ riskScore: -1 });

module.exports = mongoose.model("GisLayer", gisLayerSchema);
