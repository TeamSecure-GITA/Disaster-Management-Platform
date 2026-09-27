const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
        "water_level",
        "temperature",
        "humidity",
        "smoke",
        "soil_moisture",
        "pressure",
        "air_quality",
        // Landslide and geotechnical specific sensor types:
        "tilt",
        "mems_tilt",
        "piezometer",
        "rain_gauge",
        "extensometer",
        "geophone",
        "other",
      ],
      required: true,
      index: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    status: {
      type: String,
      enum: ["online", "offline", "maintenance", "error", "alert"],
      default: "offline",
      index: true,
    },

    unit: {
      type: String,
      default: "",
    },

    threshold: {
      warning: {
        type: Number,
        default: null,
      },
      critical: {
        type: Number,
        default: null,
      },
    },

    lastReading: {
      type: Number,
      default: null,
    },

    lastSeen: {
      type: Date,
      default: null,
      index: true,
    },

    connectivity: {
      protocol: {
        type: String,
        enum: [
          "lora",
          "lorawan",
          "gsm_gprs",
          "cellular_4g",
          "satellite",
          "ble_mesh",
          "direct_ip",
        ],
        default: "lora",
      },
      gatewayId: {
        type: String,
        default: null,
        index: true,
      },
      devEui: {
        type: String,
        default: null,
      },
      batteryVoltage: {
        type: Number,
        default: 3.8, // Volts
      },
      batteryPct: {
        type: Number,
        default: 100, // %
      },
      rssi: {
        type: Number,
        default: -75, // dBm
      },
      snr: {
        type: Number,
        default: 8.5, // dB
      },
    },

    geotechProfile: {
      state: {
        type: String,
        default: "Sikkim",
        index: true,
      },
      district: {
        type: String,
        default: "",
      },
      corridor: {
        type: String,
        default: null, // e.g. "NH-10", "NH-29", "NH-6"
        index: true,
      },
      slopeAngleDeg: {
        type: Number,
        default: 45,
      },
      installationDepthMeters: {
        type: Number,
        default: 2.5,
      },
      factorOfSafetyBaseline: {
        type: Number,
        default: 1.35,
      },
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

sensorSchema.index({ location: "2dsphere" });
sensorSchema.index({ "geotechProfile.state": 1, status: 1 });

module.exports = mongoose.model("Sensor", sensorSchema);