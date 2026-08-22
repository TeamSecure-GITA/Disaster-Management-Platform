const mongoose = require("mongoose");

const satelliteDataSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: true,
      trim: true,
    },

    satellite: {
      type: String,
      default: "",
    },

    dataType: {
      type: String,
      enum: [
        "imagery",
        "weather",
        "flood",
        "fire",
        "vegetation",
        "disaster",
        "other",
      ],
      required: true,
      index: true,
    },

    imageUrl: {
      type: String,
      default: null,
    },

    metadataUrl: {
      type: String,
      default: null,
    },

    acquisitionTime: {
      type: Date,
      required: true,
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

    resolutionMeters: {
      type: Number,
      default: null,
    },

    cloudCoverage: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    processingStatus: {
      type: String,
      enum: ["raw", "processing", "processed", "failed"],
      default: "raw",
    },

    analysisResults: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

satelliteDataSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("SatelliteData", satelliteDataSchema);