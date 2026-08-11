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

module.exports = mongoose.model("SensorReading", sensorReadingSchema);