const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    availability: {
      type: String,
      enum: ["available", "busy", "unavailable"],
      default: "available",
      index: true,
    },

    experience: {
      type: String,
      trim: true,
      default: "",
    },

    certifications: {
      type: [String],
      default: [],
    },

    emergencyTraining: {
      type: Boolean,
      default: false,
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
      default: "Unknown",
    },

    currentLocation: {
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

    serviceRadiusKm: {
      type: Number,
      min: 1,
      max: 500,
      default: 25,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    totalTasksCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

volunteerSchema.index({ currentLocation: "2dsphere" });

module.exports = mongoose.model("Volunteer", volunteerSchema);