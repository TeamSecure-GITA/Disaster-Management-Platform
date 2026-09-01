const mongoose = require("mongoose");

// ─── Media sub-document ──────────────────────────────────────────────────────
const mediaSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
        },
        filename: {
            type: String,
            default: "",
        },
        provider: {
            type: String,
            enum: ["local", "cloudinary"],
            default: "local",
        },
        publicId: {
            type: String,
            default: null,
        },
        resourceType: {
            // "image" | "video" as returned by Cloudinary
            type: String,
            default: "image",
        },
        capturedAt: {
            // EXIF capture time from mobile, falls back to upload time
            type: Date,
            default: null,
        },
    },
    { _id: false }
);

// ─── Incident schema ──────────────────────────────────────────────────────────
const incidentSchema = new mongoose.Schema(
    {
        // ── Who reported ──────────────────────────────────────────────────────
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // ── Classification ────────────────────────────────────────────────────
        incidentType: {
            type: String,
            required: true,
            enum: [
                "landslide_crack",
                "blocked_road",
                "slope_movement",
                "soil_erosion",
                "flooding",
                "bridge_damage",
                "other",
            ],
            index: true,
        },

        severity: {
            type: String,
            required: true,
            enum: ["low", "medium", "high", "critical"],
            default: "medium",
            index: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 3000,
        },

        // ── GeoJSON location (2dsphere indexed for spatial queries) ───────────
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                // [longitude, latitude] — GeoJSON standard
                type: [Number],
                required: true,
                validate: {
                    validator: (coords) =>
                        Array.isArray(coords) &&
                        coords.length === 2 &&
                        coords[0] >= -180 &&
                        coords[0] <= 180 &&
                        coords[1] >= -90 &&
                        coords[1] <= 90,
                    message:
                        "Coordinates must be [longitude, latitude] within valid ranges.",
                },
            },
        },

        // ── NE Region context metadata ─────────────────────────────────────────
        locationMeta: {
            address: { type: String, trim: true, default: "" },
            district: { type: String, trim: true, default: "", index: true },
            state: {
                type: String,
                trim: true,
                default: "",
                // NE states covered by the SIH problem statement
                enum: [
                    "Arunachal Pradesh",
                    "Assam",
                    "Manipur",
                    "Meghalaya",
                    "Mizoram",
                    "Nagaland",
                    "Sikkim",
                    "Tripura",
                    "",
                ],
            },
            altitude: {
                // metres above sea level — relevant for slope risk
                type: Number,
                default: null,
            },
            slopeAngle: {
                // degrees — key input for landslide probability
                type: Number,
                min: 0,
                max: 90,
                default: null,
            },
        },

        // ── Field observations ────────────────────────────────────────────────
        witnessCount: {
            type: Number,
            min: 0,
            default: 1,
        },

        isRoadBlocked: {
            type: Boolean,
            default: false,
        },

        affectedVillages: {
            type: [String],
            default: [],
        },

        // ── Auto-computed risk score 0–100 (set by pre-save hook) ─────────────
        riskScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
            index: true,
        },

        // ── Uploaded media (images + short videos) ────────────────────────────
        media: {
            type: [mediaSchema],
            default: [],
        },

        // ── Workflow status ───────────────────────────────────────────────────
        status: {
            type: String,
            enum: ["pending", "verified", "escalated", "resolved", "rejected"],
            default: "pending",
            index: true,
        },

        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        verifiedAt: {
            type: Date,
            default: null,
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        remarks: {
            type: String,
            trim: true,
            default: "",
        },

        // ── Offline sync support ──────────────────────────────────────────────
        // Client-generated UUID; unique sparse index allows safe retries
        offlineId: {
            type: String,
            default: null,
            trim: true,
        },

        syncedAt: {
            type: Date,
            default: () => new Date(),
        },
    },
    {
        timestamps: true,
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
incidentSchema.index({ location: "2dsphere" });
incidentSchema.index({ offlineId: 1 }, { unique: true, sparse: true });
incidentSchema.index({ createdAt: -1 });
incidentSchema.index({ incidentType: 1, severity: 1, status: 1 });

// ─── Pre-save: compute riskScore ──────────────────────────────────────────────
const SEVERITY_BASE = { low: 15, medium: 35, high: 65, critical: 90 };

incidentSchema.pre("save", function (next) {
    const base = SEVERITY_BASE[this.severity] || 35;

    // Witness boost: each additional witness adds up to 5 points (cap 10)
    const witnessBoost = Math.min((this.witnessCount - 1) * 2.5, 10);

    // Road blocked adds urgency
    const roadBoost = this.isRoadBlocked ? 5 : 0;

    // Slope angle amplifier: steep slopes get up to 10 extra points
    const slopeBoost =
        this.locationMeta?.slopeAngle != null
            ? Math.min((this.locationMeta.slopeAngle / 90) * 10, 10)
            : 0;

    this.riskScore = Math.min(
        Math.round(base + witnessBoost + roadBoost + slopeBoost),
        100
    );

    next();
});

module.exports = mongoose.model("Incident", incidentSchema);
