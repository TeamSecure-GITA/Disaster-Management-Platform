const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "water_level",
        "temperature",
        "humidity",
        "smoke",
        "soil_moisture",
        "pressure",
        "air_quality",
        "other",
      ],
      required: true,
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

    status: {
      type: String,
      enum: ["online", "offline", "maintenance", "error"],
      default: "offline",
      index: true,
    },

    unit: {
      type: String,
      default: "",
    },

    threshold: {
      warning: {
        type: Number,
        default: null,
      },
      critical: {
        type: Number,
        default: null,
      },
    },

    lastReading: {
      type: Number,
      default: null,
    },

    lastSeen: {
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

sensorSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Sensor", sensorSchema);