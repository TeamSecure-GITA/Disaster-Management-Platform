const mongoose = require("mongoose");

// ─── Acknowledgement sub-document ────────────────────────────────────────────
const ackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, default: "user" },
    acknowledgedAt: { type: Date, default: Date.now },
    remarks: { type: String, default: "" },
  },
  { _id: false }
);

// ─── Escalation record sub-document ──────────────────────────────────────────
const escalationSchema = new mongoose.Schema(
  {
    escalatedAt: { type: Date, default: Date.now },
    escalatedTo: { type: String, required: true },   // role name e.g. "sdrf"
    reason: { type: String, default: "no_ack_within_sla" },
    triggeredBy: { type: String, default: "system" },
  },
  { _id: false }
);

// ─── Per-language content sub-document ───────────────────────────────────────
const localizedContentSchema = new mongoose.Schema(
  {
    lang: { type: String, required: true },          // "en" | "hi" | "as" | "bn" | "ne"
    title: { type: String, required: true },
    message: { type: String, required: true },
    instructions: { type: [String], default: [] },
  },
  { _id: false }
);

// ─── Main Alert schema ────────────────────────────────────────────────────────
const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Localised variants (populated by i18n helper at creation time)
    localizedContent: {
      type: [localizedContentSchema],
      default: [],
    },

    type: {
      type: String,
      enum: [
        "flood",
        "fire",
        "cyclone",
        "earthquake",
        "landslide",
        "tsunami",
        "storm",
        "heatwave",
        "other",
      ],
      required: true,
      index: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
      index: true,
    },

    // ── Geospatial ────────────────────────────────────────────────────────────
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    radiusKm: {
      type: Number,
      default: 10,
      min: 0,
    },

    // ── Targeting ─────────────────────────────────────────────────────────────
    /** ISO district codes / names targeted by this alert */
    targetDistricts: {
      type: [String],
      default: [],
      index: true,
    },

    /** Roles that must receive this alert (DDMA, SDRF, village_fp, public) */
    targetRoles: {
      type: [String],
      enum: ["ddma", "sdrf", "village_fp", "operator", "admin", "public"],
      default: ["public"],
      index: true,
    },

    // ── Source / provenance ───────────────────────────────────────────────────
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },

    isGovtOfficial: {
      type: Boolean,
      default: false,
      index: true,
    },

    sourceAgency: {
      type: String,
      default: "Internal",
      trim: true,
    },

    sourceUrl: {
      type: String,
      default: "",
      trim: true,
    },

    externalId: {
      type: String,
      index: true,
      sparse: true,
    },

    country: {
      type: String,
      default: "India",
      trim: true,
    },

    feedSource: {
      type: String,
      enum: [
        "NDMA_SACHET_CAP",
        "GDACS_RSS",
        "USGS_GEOJSON",
        "LANDSLIDE_RISK_ENGINE",
        "INTERNAL",
        "MANUAL",
      ],
      default: "INTERNAL",
      index: true,
    },

    // ── CAP / WMO fields ──────────────────────────────────────────────────────
    urgency: {
      type: String,
      enum: ["Immediate", "Expected", "Future", "Past", "Unknown"],
      default: "Immediate",
    },

    certainty: {
      type: String,
      enum: ["Observed", "Likely", "Possible", "Unlikely", "Unknown"],
      default: "Observed",
    },

    earlyWarningLeadTimeMinutes: {
      type: Number,
      default: 0,
    },

    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },

    instructions: {
      type: [String],
      default: [],
    },

    affectedAreas: {
      type: [String],
      default: [],
    },

    sourceNodalAgency: {
      type: String,
      default: "",
      trim: true,
    },

    // ── Landslide risk-engine provenance ──────────────────────────────────────
    landslideRiskScore: {
      type: Number,
      default: null,
    },

    landslideRiskLevel: {
      type: String,
      enum: ["LOW", "MODERATE", "HIGH", "CRITICAL", null],
      default: null,
    },

    rainfallTrigger: {
      rain24h: { type: Number, default: null },
      rain72h: { type: Number, default: null },
      imdCategory: { type: String, default: null },
    },

    // ── Acknowledgement & escalation tracking ─────────────────────────────────
    acknowledgements: {
      type: [ackSchema],
      default: [],
    },

    /** Roles that have acknowledged (denormalised for quick $in queries) */
    acknowledgedRoles: {
      type: [String],
      default: [],
      index: true,
    },

    escalations: {
      type: [escalationSchema],
      default: [],
    },

    /** Time by which authorities must ack before escalation fires (minutes) */
    ackSlaMinutes: {
      type: Number,
      default: 30,
    },

    lastEscalatedAt: {
      type: Date,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

alertSchema.index({ location: "2dsphere" });
alertSchema.index({ targetDistricts: 1, status: 1 });
alertSchema.index({ targetRoles: 1, status: 1 });
alertSchema.index({ createdAt: -1, severity: 1 });

module.exports = mongoose.model("Alert", alertSchema);