const mongoose = require("mongoose");

const terrainGridSchema = new mongoose.Schema(
  {
    gridId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    demSource: {
      type: String,
      enum: ["Copernicus GLO-30", "SRTM 30m", "CartoDEM 30m", "ALOS AW3D30"],
      default: "Copernicus GLO-30",
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

    boundingBox: {
      type: [Number], // [minLng, minLat, maxLng, maxLat]
      default: [],
    },

    resolutionMeters: {
      type: Number,
      default: 30, // 30m standard DEM grid cell
    },

    elevationMeters: {
      type: Number,
      required: true,
    },

    slopeDeg: {
      type: Number,
      required: true,
      min: 0,
      max: 90,
    },

    aspectDeg: {
      type: Number,
      required: true,
      min: -1,
      max: 360,
    },

    aspectDirection: {
      type: String,
      enum: ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "FLAT"],
      default: "FLAT",
    },

    curvature: {
      profileCurvature: {
        type: Number,
        default: 0, // < 0 indicates concave deceleration zone, > 0 indicates convex acceleration crest
      },
      planformCurvature: {
        type: Number,
        default: 0, // < 0 indicates convergent hollow/gully flow, > 0 indicates divergent ridge
      },
      generalCurvature: {
        type: Number,
        default: 0, // Laplacian of elevation
      },
    },

    distanceToRoadsMeters: {
      type: Number,
      default: 9999, // geodesic distance to closest transport corridor / toe-cut
    },

    nearestRoadName: {
      type: String,
      default: "Unclassified Hill Road",
    },

    distanceToStreamsMeters: {
      type: Number,
      default: 9999, // geodesic distance to closest drainage channel / toe scour
    },

    nearestStreamName: {
      type: String,
      default: "Unclassified Drainage Channel",
    },

    lithology: {
      rockType: {
        type: String,
        default: "Schist / Phyllite",
      },
      formation: {
        type: String,
        default: "Daling Group",
      },
      strengthClass: {
        type: String,
        enum: ["VERY_LOW", "LOW", "MODERATE", "HIGH", "VERY_HIGH"],
        default: "LOW",
      },
      cohesionKPa: {
        type: Number,
        default: 15.0, // effective cohesion c'
      },
      frictionAngleDeg: {
        type: Number,
        default: 26.0, // effective friction angle phi'
      },
      weatheringGrade: {
        type: String,
        enum: ["I", "II", "III", "IV", "V", "VI"], // I: Fresh to VI: Residual Soil
        default: "IV",
      },
    },

    landCover: {
      classification: {
        type: String,
        default: "Dense Evergreen Forest",
      },
      canopyCoverPct: {
        type: Number,
        default: 75,
      },
      rootCohesionKPa: {
        type: Number,
        default: 5.5, // root tensile reinforcement delta-S
      },
      erosionRisk: {
        type: String,
        enum: ["Low", "Moderate", "High", "Critical"],
        default: "Moderate",
      },
    },

    terrainRiskMultiplier: {
      type: Number,
      default: 1.0, // combined geotechnical susceptibility multiplier (0.5 to 2.5)
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

terrainGridSchema.index({ location: "2dsphere" });
terrainGridSchema.index({ slopeDeg: 1, demSource: 1 });
terrainGridSchema.index({ distanceToRoadsMeters: 1 });
terrainGridSchema.index({ distanceToStreamsMeters: 1 });

module.exports = mongoose.model("TerrainGrid", terrainGridSchema);
