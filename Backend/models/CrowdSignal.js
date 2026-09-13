const mongoose = require("mongoose");

const crowdSignalSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    disasterType: {
      type: String,
      enum: ["earthquake", "flood", "cyclone", "landslide", "fire", "storm", "other"],
      default: "other",
      index: true,
    },

    // Volume metrics
    currentVelocityPerMin: {
      type: Number,
      default: 0,
    },

    baselineAvgPerMin: {
      type: Number,
      default: 1,
    },

    surgeRatio: {
      type: Number,
      default: 1.0,
      index: true,
    },

    zScore: {
      type: Number,
      default: 0,
    },

    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },

    // Sample posts / text snippets capturing early situational details
    samplePosts: [
      {
        text: { type: String, required: true },
        author: { type: String, default: "anonymous" },
        createdAt: { type: Date, default: Date.now },
        uri: { type: String, default: "" },
      },
    ],

    // Geographic entities extracted from post text
    detectedLocations: {
      type: [String],
      default: [],
    },

    coordinates: {
      type: [Number], // [lon, lat] if resolved
      default: null,
    },

    source: {
      type: String,
      enum: ["BLUESKY_STREAM", "GDACS_MEDIA_ANOMALY", "SOCIAL_FEED"],
      default: "BLUESKY_STREAM",
      index: true,
    },

    status: {
      type: String,
      enum: ["unverified_signal", "escalated_to_incident", "dismissed"],
      default: "unverified_signal",
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

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

crowdSignalSchema.index({ createdAt: -1 });

module.exports = mongoose.model("CrowdSignal", crowdSignalSchema);
