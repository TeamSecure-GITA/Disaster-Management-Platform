/**
 * Terrain Controller
 * Handles DEM topographic derivations, grid GeoJSON generation,
 * corridor elevation profiles, and geotechnical multi-factor LSI calculations.
 */

const terrainService = require("../services/terrainService");

// GET /api/terrain/point?lat=27.33&lng=88.61&dem=Copernicus GLO-30
const getPointTerrain = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const dem = req.query.dem || "Copernicus GLO-30";

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Valid numeric 'lat' and 'lng' query parameters are required.",
      });
    }

    const terrain = await terrainService.getTerrainAtCoordinates(lat, lng, dem);

    return res.status(200).json({
      success: true,
      demSource: terrain.demSource,
      coordinates: [terrain.location.coordinates[0], terrain.location.coordinates[1]],
      topography: {
        elevationMeters: terrain.elevationMeters,
        slopeDeg: terrain.slopeDeg,
        aspectDeg: terrain.aspectDeg,
        aspectDirection: terrain.aspectDirection,
        curvature: terrain.curvature,
      },
      proximity: {
        distanceToRoadsMeters: terrain.distanceToRoadsMeters,
        nearestRoadName: terrain.nearestRoadName,
        distanceToStreamsMeters: terrain.distanceToStreamsMeters,
        nearestStreamName: terrain.nearestStreamName,
      },
      geology: terrain.lithology,
      ecology: terrain.landCover,
      terrainRiskMultiplier: terrain.terrainRiskMultiplier,
      gridId: terrain.gridId,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/terrain/grid?bbox=88.4,27.1,88.7,27.4&resolution=300
const getGridTerrain = async (req, res, next) => {
  try {
    let minLng, minLat, maxLng, maxLat;

    if (req.query.bbox) {
      const parts = req.query.bbox.split(",").map(Number);
      if (parts.length === 4 && !parts.some(isNaN)) {
        [minLng, minLat, maxLng, maxLat] = parts;
      }
    } else {
      minLng = parseFloat(req.query.minLng);
      minLat = parseFloat(req.query.minLat);
      maxLng = parseFloat(req.query.maxLng);
      maxLat = parseFloat(req.query.maxLat);
    }

    // Default to Sikkim Teesta Valley if no bbox specified
    if ([minLng, minLat, maxLng, maxLat].some((v) => v === undefined || isNaN(v))) {
      minLng = 88.45;
      minLat = 27.20;
      maxLng = 88.65;
      maxLat = 27.40;
    }

    const resolutionMeters = parseInt(req.query.resolution, 10) || 500;
    const demSource = req.query.dem || "Copernicus GLO-30";

    const gridGeoJson = await terrainService.getGridTerrain({
      minLng,
      minLat,
      maxLng,
      maxLat,
      resolutionMeters,
      demSource,
    });

    return res.status(200).json({
      success: true,
      ...gridGeoJson,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/terrain/corridor/:corridorId (e.g. NH-10, NH-29, NH-6)
const getCorridorProfile = async (req, res, next) => {
  try {
    const { corridorId } = req.params;
    const profile = await terrainService.getCorridorTerrainProfile(corridorId);

    return res.status(200).json({
      success: true,
      ...profile,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/terrain/calculate-lsi
const calculateEnhancedLSI = async (req, res, next) => {
  try {
    const {
      rainfall24h,
      threshold,
      soilSaturation,
      slopeAngle,
      lat,
      lng,
      historicalEvents,
    } = req.body;

    const result = await terrainService.calculateEnhancedLSI({
      rainfall24h: Number(rainfall24h) || 50,
      threshold: Number(threshold) || 100,
      soilSaturation: Number(soilSaturation) || 50,
      slopeAngle: slopeAngle !== undefined ? Number(slopeAngle) : null,
      lat: lat !== undefined ? Number(lat) : null,
      lng: lng !== undefined ? Number(lng) : null,
      historicalEvents: Number(historicalEvents) || 3,
    });

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/terrain/sources
const getTerrainSources = (req, res) => {
  res.status(200).json({
    success: true,
    sources: [
      {
        id: "Copernicus GLO-30",
        name: "Copernicus Global DEM 30m",
        provider: "European Space Agency (ESA) & Airbus",
        resolution: "30 meters (1 arc-second)",
        coverage: "Global (Himalayan / NER calibrated)",
        features: ["Elevation (z)", "Slope", "Aspect", "Profile Curvature", "Planform Curvature"],
      },
      {
        id: "SRTM 30m",
        name: "Shuttle Radar Topography Mission (SRTM GL1)",
        provider: "NASA / USGS",
        resolution: "30 meters",
        coverage: "Latitudes 60°N to 56°S",
        features: ["Elevation (z)", "Slope", "Hydrological Drainage"],
      },
      {
        id: "CartoDEM 30m",
        name: "ISRO Cartosat-1 Digital Elevation Model",
        provider: "ISRO / Bhuvan National Remote Sensing Centre",
        resolution: "30 meters",
        coverage: "Indian Subcontinent & NER",
        features: ["High vertical precision across Indian mountain terrains"],
      },
    ],
    thematicLayers: [
      {
        layer: "Lithology & Rock Shear Strength",
        source: "Geological Survey of India (GSI) 1:50,000 Geological Maps",
        attributes: ["Formation", "Rock Type", "Shear Strength Class", "Cohesion (c')", "Friction Angle (phi')"],
      },
      {
        layer: "Land Use / Land Cover (LULC)",
        source: "Copernicus Global Land Cover & NRSC Bhuvan LULC",
        attributes: ["Classification", "Canopy Cover %", "Root Cohesion (kPa)", "Erosion Risk"],
      },
      {
        layer: "Transport Corridors & Road Cuts",
        source: "MoRTH & BRO (Border Roads Organisation) Highway Alignments",
        attributes: ["NH-10", "NH-29", "NH-6", "NH-13", "NH-54", "NH-2", "NH-37", "NH-8"],
      },
      {
        layer: "Drainage Channels & Fluvial Scour",
        source: "Central Water Commission (CWC) & Survey of India Hydrography",
        attributes: ["Teesta", "Dzüdza", "Lubha", "Kameng", "Tuirial", "Barak", "Imphal", "Gumti"],
      },
    ],
  });
};

// GET /api/terrain/model-validation

const getModelValidation = async (req, res, next) => {
  try {
    const report = await terrainService.getModelValidationBenchmark();
    return res.status(200).json(report);
  } catch (error) {
    next(error);
  }
};

// POST /api/terrain/predict-grid-cells
const predictGridCells = async (req, res, next) => {
  try {
    const result = await terrainService.predictGridCells(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// POST /api/terrain/predict-road-segments
const predictRoadSegments = async (req, res, next) => {
  try {
    const result = await terrainService.predictRoadSegments(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPointTerrain,
  getGridTerrain,
  getCorridorProfile,
  calculateEnhancedLSI,
  getTerrainSources,
  getModelValidation,
  predictGridCells,
  predictRoadSegments,
};

