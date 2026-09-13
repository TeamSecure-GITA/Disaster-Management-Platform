const mongoose = require("mongoose");

const amcContractSchema = new mongoose.Schema(
  {
    contractId: {
      type: String,
      default: null,
      trim: true,
    },
    authority: {
      type: String,
      default: null,
      trim: true,
    },
    tier: {
      type: String,
      enum: ["basic", "standard", "premium", null],
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    amountINR: {
      type: Number,
      default: null,
    },
  },
  { _id: false }
);

const loRaBeaconSchema = new mongoose.Schema(
  {
    deviceEui: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    villageName: {
      type: String,
      default: "",
      trim: true,
    },

    district: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    type: {
      type: String,
      enum: ["beacon", "gateway", "relay"],
      default: "beacon",
      index: true,
    },

    powerSource: {
      type: String,
      enum: ["solar", "battery", "hybrid"],
      default: "solar",
    },

    status: {
      type: String,
      enum: ["online", "offline", "low_battery", "maintenance", "pending"],
      default: "pending",
      index: true,
    },

    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    solarVoltage: {
      type: Number,
      default: null,
    },

    firmwareVersion: {
      type: String,
      default: "1.0.0",
      trim: true,
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

    lastHeartbeat: {
      type: Date,
      default: null,
    },

    meshNeighbors: {
      type: [String],
      default: [],
    },

    tiltThreshold: {
      type: Number,
      default: 15,
      min: 1,
      max: 90,
    },

    installDate: {
      type: Date,
      default: null,
    },

    amcContract: {
      type: amcContractSchema,
      default: () => ({}),
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

loRaBeaconSchema.index({ location: "2dsphere" });
loRaBeaconSchema.index({ villageName: 1, district: 1 });

module.exports = mongoose.model("LoRaBeacon", loRaBeaconSchema);
