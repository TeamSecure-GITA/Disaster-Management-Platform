const mongoose = require("mongoose");

const waypointSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    altitude: {
      type: Number,
      default: 50,
    },

    order: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const droneMissionSchema = new mongoose.Schema(
  {
    drone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drone",
      required: true,
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
        "surveillance",
        "search_rescue",
        "mapping",
        "fire_monitoring",
        "flood_monitoring",
        "delivery",
        "other",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "planned",
        "approved",
        "in_progress",
        "completed",
        "aborted",
      ],
      default: "planned",
      index: true,
    },

    waypoints: {
      type: [waypointSchema],
      default: [],
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startTime: {
      type: Date,
      default: null,
    },

    endTime: {
      type: Date,
      default: null,
    },

    objective: {
      type: String,
      default: "",
    },

    findings: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DroneMission", droneMissionSchema);