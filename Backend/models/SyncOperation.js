const mongoose = require("mongoose");

const syncOperationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    operationId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    resource: {
      type: String,
      enum: ["family"],
      required: true,
    },
    action: {
      type: String,
      enum: ["upsert", "add_member", "update_member", "delete_member", "update_safety"],
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["applied", "rejected"],
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
    clientCreatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

syncOperationSchema.index({ user: 1, operationId: 1 }, { unique: true });

module.exports = mongoose.model("SyncOperation", syncOperationSchema);