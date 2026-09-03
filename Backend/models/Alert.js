const mongoose = require("mongoose");

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
  },
  {
    timestamps: true,
  }
);

alertSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Alert", alertSchema);