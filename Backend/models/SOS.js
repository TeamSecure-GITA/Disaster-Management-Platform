const mongoose = require("mongoose");

const sosSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    message: {
      type: String,
      default: "",
      trim: true,
    },

    emergencyType: {
      type: String,
      enum: [
        "medical",
        "trapped",
        "fire",
        "flood",
        "accident",
        "missing_person",
        "other",
      ],
      default: "other",
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
      enum: ["active", "acknowledged", "responding", "resolved", "cancelled"],
      default: "active",
      index: true,
    },

    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Volunteer",
      default: null,
    },

    respondedAt: {
      type: Date,
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    priority: {
      type: String,
      enum: ["normal", "high", "critical"],
      default: "critical",
    },
  },
  {
    timestamps: true,
  }
);

sosSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("SOS", sosSchema);