const mongoose = require("mongoose");

const callbackRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["queued", "assigned", "completed", "cancelled"],
      default: "queued",
      index: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CallbackRequest", callbackRequestSchema);
