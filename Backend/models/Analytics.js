const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    metricName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    category: {
      type: String,
      enum: [
        "disaster",
        "alert",
        "sos",
        "resource",
        "volunteer",
        "shelter",
        "prediction",
        "sensor",
        "drone",
        "system",
        "other",
      ],
      required: true,
      index: true,
    },

    value: {
      type: Number,
      required: true,
    },

    unit: {
      type: String,
      default: "",
    },

    period: {
      type: String,
      enum: ["hourly", "daily", "weekly", "monthly", "yearly", "custom"],
      default: "daily",
    },

    periodStart: {
      type: Date,
      required: true,
      index: true,
    },

    periodEnd: {
      type: Date,
      required: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: undefined,
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
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

analyticsSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Analytics", analyticsSchema);