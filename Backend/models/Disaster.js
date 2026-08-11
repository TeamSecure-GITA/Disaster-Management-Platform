const mongoose = require("mongoose");

const disasterSchema = new mongoose.Schema(
  {
    name: {
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
        "drought",
        "other",
      ],
      required: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["reported", "active", "contained", "resolved"],
      default: "reported",
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

    affectedPopulation: {
      type: Number,
      default: 0,
      min: 0,
    },

    casualties: {
      type: Number,
      default: 0,
      min: 0,
    },

    injured: {
      type: Number,
      default: 0,
      min: 0,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
      default: null,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

disasterSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Disaster", disasterSchema);