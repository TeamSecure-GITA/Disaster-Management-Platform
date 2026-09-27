const mongoose = require("mongoose");

const sensorReadingSchema = new mongoose.Schema(
  {
    sensor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sensor",
      required: true,
      index: true,
    },

    deviceId: {
      type: String,
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

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },

    quality: {
      type: String,
      enum: ["good", "warning", "critical", "invalid"],
      default: "good",
    },

    isThresholdExceeded: {
      type: Boolean,
      default: false,
    },

    alertTriggered: {
      type: Boolean,
      default: false,
    },

    alertSeverity: {
      type: String,
      enum: ["normal", "warning", "critical"],
      default: "normal",
    },

    gatewayId: {
      type: String,
      default: null,
      index: true,
    },

    protocol: {
      type: String,
      default: "lora",
    },

    batteryPct: {
      type: Number,
      default: null,
    },

    rssi: {
      type: Number,
      default: null,
    },

    snr: {
      type: Number,
      default: null,
    },

    geotechMetrics: {
      porePressureRatio: { type: Number, default: null }, // Ru ratio
      tiltRateDegPerDay: { type: Number, default: null },
      crackOpeningRateMmPerHr: { type: Number, default: null },
      estimatedFoS: { type: Number, default: null }, // Factor of Safety
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

sensorReadingSchema.index({
  sensor: 1,
  timestamp: -1,
});

sensorReadingSchema.index({
  deviceId: 1,
  timestamp: -1,
});

module.exports = mongoose.model("SensorReading", sensorReadingSchema);