const mongoose = require("mongoose");

const rainfallRecordSchema = new mongoose.Schema(
  {
    stationId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    stationName: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    district: {
      type: String,
      default: "",
      trim: true,
    },
    corridor: {
      type: String,
      default: null,
      trim: true,
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
    source: {
      type: String,
      enum: [
        "OPEN_METEO_GRID",
        "IMD_AWS_STATION",
        "GPM_IMERG",
        "OPENWEATHERMAP",
        "SIMULATED_GAUGE",
      ],
      default: "OPEN_METEO_GRID",
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    rolling: {
      rain1h: {
        type: Number,
        default: 0,
      },
      rain3h: {
        type: Number,
        default: 0,
      },
      rain24h: {
        type: Number,
        default: 0,
      },
      rain72h: {
        type: Number,
        default: 0,
      },
    },
    forecast: {
      rainNext6h: {
        type: Number,
        default: 0,
      },
      rainNext24h: {
        type: Number,
        default: 0,
      },
      rainNext72h: {
        type: Number,
        default: 0,
      },
      hourlyForecast: [
        {
          time: { type: Date },
          precipitationMm: { type: Number, default: 0 },
        },
      ],
    },
    hourlyHistory: [
      {
        time: { type: Date },
        precipitationMm: { type: Number, default: 0 },
      },
    ],
    currentRainfallRate: {
      type: Number,
      default: 0,
    },
    imdIntensityCategory: {
      type: String,
      enum: [
        "No Rain",
        "Very Light Rain",
        "Light Rain",
        "Moderate Rain",
        "Heavy Rain",
        "Very Heavy Rain",
        "Extremely Heavy Rain",
      ],
      default: "No Rain",
    },
    riskIndicators: {
      threshold24hMm: {
        type: Number,
        default: 100,
      },
      saturationTriggerBreached: {
        type: Boolean,
        default: false,
      },
      antecedentMoistureIndex: {
        type: Number,
        default: 0,
      },
      landslideTriggerRisk: {
        type: String,
        enum: ["LOW", "MODERATE", "HIGH", "CRITICAL"],
        default: "LOW",
      },
      flashFloodTriggerRisk: {
        type: String,
        enum: ["LOW", "MODERATE", "HIGH", "CRITICAL"],
        default: "LOW",
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

rainfallRecordSchema.index({ stationId: 1, timestamp: -1 });
rainfallRecordSchema.index({ state: 1, timestamp: -1 });
rainfallRecordSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("RainfallRecord", rainfallRecordSchema);
