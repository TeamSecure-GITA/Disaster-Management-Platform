const mongoose = require("mongoose");

const droneSchema = new mongoose.Schema(
  {
    droneId: {
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

    manufacturer: {
      type: String,
      default: "",
    },

    model: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "available",
        "in_mission",
        "charging",
        "maintenance",
        "offline",
      ],
      default: "offline",
      index: true,
    },

    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    altitude: {
      type: Number,
      default: 0,
    },

    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    cameraAvailable: {
      type: Boolean,
      default: true,
    },

    thermalCamera: {
      type: Boolean,
      default: false,
    },

    lastTelemetryAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

droneSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Drone", droneSchema);