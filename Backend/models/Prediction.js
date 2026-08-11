const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    disasterType: {
      type: String,
      enum: [
        "flood",
        "fire",
        "cyclone",
        "landslide",
        "earthquake",
        "heatwave",
        "other",
      ],
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

    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
      index: true,
    },

    probability: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },

    predictedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    validUntil: {
      type: Date,
      default: null,
    },

    modelName: {
      type: String,
      default: "",
    },

    modelVersion: {
      type: String,
      default: "",
    },

    inputData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    recommendations: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

predictionSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Prediction", predictionSchema);