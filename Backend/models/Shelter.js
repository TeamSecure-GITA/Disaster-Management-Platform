const mongoose = require("mongoose");

const shelterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    state: {
      type: String,
      trim: true,
      default: "",
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

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    currentOccupancy: {
      type: Number,
      default: 0,
      min: 0,
    },

    contactNumber: {
      type: String,
      default: "",
    },

    facilities: {
      type: [String],
      default: [],
    },

    accessibility: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["open", "full", "closed", "maintenance"],
      default: "open",
      index: true,
    },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

shelterSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Shelter", shelterSchema);