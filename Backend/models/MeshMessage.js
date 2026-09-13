const mongoose = require("mongoose");

const meshMessageSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["sos", "soil_tilt", "heartbeat", "alert", "data"],
      required: true,
      index: true,
    },

    originBeacon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoRaBeacon",
      default: null,
      index: true,
    },

    originEui: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    relayPath: {
      type: [String],
      default: [],
    },

    gatewayBeacon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoRaBeacon",
      default: null,
    },

    gatewayEui: {
      type: String,
      default: null,
      uppercase: true,
      trim: true,
    },

    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

    rssi: {
      type: Number,
      default: null,
    },

    snr: {
      type: Number,
      default: null,
    },

    hopCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    originatedAt: {
      type: Date,
      default: null,
    },

    receivedAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["received", "acknowledged", "dispatched", "resolved"],
      default: "received",
      index: true,
    },

    linkedSOS: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SOS",
      default: null,
    },

    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    acknowledgedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

meshMessageSchema.index({ location: "2dsphere" });
meshMessageSchema.index({ originBeacon: 1, createdAt: -1 });
meshMessageSchema.index({ type: 1, createdAt: -1 });

// Auto-expire heartbeat messages after 30 days to keep the collection lean
meshMessageSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: { type: "heartbeat" },
  }
);

module.exports = mongoose.model("MeshMessage", meshMessageSchema);
