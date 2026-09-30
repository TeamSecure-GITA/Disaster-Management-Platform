/**
 * RoadSegment.js – per-segment road status model for GIS mapping.
 *
 * Each document represents a named road segment (highway section, bridge, etc.)
 * with its current status, risk score, and geometry for map rendering.
 */
"use strict";

const mongoose = require("mongoose");

const roadSegmentSchema = new mongoose.Schema(
  {
    /** Short human-readable name, e.g. "NH-40 Km 38-52 (Meghalaya)" */
    name: { type: String, required: true, trim: true },

    /** NHID or state highway code */
    highwayCode: { type: String, trim: true, default: null },

    state: { type: String, trim: true },
    district: { type: String, trim: true },

    /**
     * GeoJSON LineString representing the road centre-line.
     * coordinates: [[lng, lat], [lng, lat], ...]
     */
    geometry: {
      type: { type: String, enum: ["LineString"], default: "LineString" },
      coordinates: { type: [[Number]], required: true },
    },

    /**
     * Operational status (matches OGSF / NDMA terminology):
     *   open       – fully passable
     *   restricted – passable with caution / single lane
     *   blocked    – impassable (landslide, flood)
     *   unknown    – no recent data
     */
    status: {
      type: String,
      enum: ["open", "restricted", "blocked", "unknown"],
      default: "unknown",
      index: true,
    },

    /** 0–100 risk score from model output */
    riskScore: { type: Number, default: null, min: 0, max: 100 },

    /** E.g. "landslide", "flood", "cyclone" */
    hazardType: { type: String, default: null },

    /** Free-text status reason (e.g. "Debris flow at Km 42.3") */
    statusNote: { type: String, trim: true, default: null },

    /** How the status was last updated */
    statusSource: {
      type: String,
      enum: ["model", "field_report", "govt_feed", "sensor", "manual"],
      default: "model",
    },

    /** Timestamp of last status change */
    statusUpdatedAt: { type: Date, default: null },

    /** BRO / PWD responsible division */
    authority: { type: String, default: null },

    /** True if this segment serves as a critical evacuation corridor */
    isEvacuationRoute: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 2dsphere index on geometry for spatial queries
roadSegmentSchema.index({ geometry: "2dsphere" });
roadSegmentSchema.index({ state: 1, status: 1 });
roadSegmentSchema.index({ riskScore: -1 });

module.exports = mongoose.model("RoadSegment", roadSegmentSchema);
