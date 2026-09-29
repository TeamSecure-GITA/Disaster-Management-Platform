const mongoose = require("mongoose");

const satelliteDataSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: true,
      trim: true,
    },

    satellite: {
      type: String,
      default: "", // e.g. "Sentinel-1A", "Sentinel-2B", "SMAP", "NISAR", "INSAT-3DR"
    },

    mission: {
      type: String,
      enum: ["SENTINEL_1_SAR", "SENTINEL_2_MSI", "COPERNICUS_EGMS", "SMAP_SOIL", "ISRO_RISAT", "INSAT_3DR", "OTHER"],
      default: "OTHER",
      index: true,
    },

    externalId: {
      type: String,
      default: null,
      sparse: true,
      unique: true,
    },

    dataType: {
      type: String,
      enum: [
        "imagery",
        "weather",
        "flood",
        "fire",
        "vegetation",
        "disaster",
        "insar_displacement",
        "sar_backscatter",
        "optical_multispectral",
        "soil_moisture",
        "other",
      ],
      required: true,
      index: true,
    },

    orbitDirection: {
      type: String,
      enum: ["ASCENDING", "DESCENDING", "GEOSTATIONARY", "UNKNOWN"],
      default: "UNKNOWN",
    },

    relativeOrbit: {
      type: Number,
      default: null,
    },

    corridor: {
      type: String,
      default: null, // e.g., "NH-10 Teesta Valley", "NH-6 Sonapur Tunnel"
      index: true,
    },

    imageUrl: {
      type: String,
      default: null,
    },

    metadataUrl: {
      type: String,
      default: null,
    },

    acquisitionTime: {
      type: Date,
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
        type: [Number],
        required: true,
      },
    },

    // GeoJSON Polygon footprint of the satellite scene/swath
    footprint: {
      type: {
        type: String,
        enum: ["Polygon", "MultiPolygon"],
      },
      coordinates: {
        type: Array,
      },
    },

    resolutionMeters: {
      type: Number,
      default: null, // e.g. 10m for Sentinel-1 GRD/Sentinel-2 MSI
    },

    cloudCoverage: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    processingStatus: {
      type: String,
      enum: ["raw", "processing", "processed", "failed"],
      default: "raw",
      index: true,
    },

    // Radar SAR C-Band backscatter & flood analysis
    sarMetrics: {
      backscatterVvDb: { type: Number, default: null }, // gamma/sigma-nought VV in dB (-25 to +5)
      backscatterVhDb: { type: Number, default: null }, // cross-pol VH in dB (-32 to -10)
      coherenceScore: { type: Number, min: 0, max: 1, default: null }, // interferometric coherence (0 to 1)
      coherenceLoss: { type: Number, default: null }, // delta coherence drop
      floodWaterMaskAreaSqKm: { type: Number, default: null }, // extracted flood inundation area
    },

    // Interferometric SAR (InSAR) surface displacement & slope kinematics
    insarMetrics: {
      losDisplacementMm: { type: Number, default: null }, // Line-of-Sight cumulative displacement (mm)
      velocityMmYear: { type: Number, default: null }, // Annualized displacement rate (mm/yr)
      interferogramCoherence: { type: Number, min: 0, max: 1, default: null },
      deformationStatus: {
        type: String,
        enum: ["stable", "slow_creep", "accelerating_creep", "critical_shear"],
        default: "stable",
      },
      cumulativeSlipMm: { type: Number, default: 0 },
    },

    // Topsoil and root-zone satellite moisture
    soilMoistureMetrics: {
      surfaceMoistureM3M3: { type: Number, default: null }, // volumetric m3/m3 (0.05 - 0.50)
      saturationPercentage: { type: Number, min: 0, max: 100, default: null },
      rootZoneEstimate: { type: Number, min: 0, max: 100, default: null },
      liquefactionRisk: {
        type: String,
        enum: ["low", "moderate", "high", "critical"],
        default: "low",
      },
    },

    // Multi-spectral optical vegetation & moisture changes (Sentinel-2)
    opticalMetrics: {
      ndviValue: { type: Number, default: null }, // Normalized Difference Vegetation Index (-1 to +1)
      ndviChange: { type: Number, default: null }, // Negative delta marks stripped vegetation / landslide scarp
      ndwiWaterIndex: { type: Number, default: null }, // Water index (-1 to +1)
      vegetationLossPercent: { type: Number, default: null },
    },

    // GIS Map layer metadata
    layerType: {
      type: String,
      enum: [
        "displacement_vector",
        "flood_inundation",
        "soil_saturation_grid",
        "vegetation_strip",
        "pass_footprint",
        "optical_rgb",
      ],
      default: "displacement_vector",
    },

    geoJsonFeature: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    rasterOverlayUrl: {
      type: String,
      default: null,
    },

    analysisResults: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

satelliteDataSchema.index({ location: "2dsphere" });
satelliteDataSchema.index({ mission: 1, dataType: 1, acquisitionTime: -1 });

module.exports = mongoose.model("SatelliteData", satelliteDataSchema);