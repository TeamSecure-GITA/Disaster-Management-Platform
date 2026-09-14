const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reviewId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: "Anonymous",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    category: {
      type: String,
      required: true,
      default: "General Feedback",
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    readByAdmin: {
      type: Boolean,
      default: false,
    },
    ip: {
      type: String,
      default: "",
    },
    device: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast administrative querying
reviewSchema.index({ submittedAt: -1 });
reviewSchema.index({ readByAdmin: 1 });
reviewSchema.index({ rating: 1 });

module.exports = mongoose.model("Review", reviewSchema);
