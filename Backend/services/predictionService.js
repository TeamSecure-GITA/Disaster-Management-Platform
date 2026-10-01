const axios = require("axios");
const Prediction = require("../models/Prediction");
const environment = require("../config/environment");

const getAiBaseUrl = () => environment.aiChatbotUrl;

const normalizeLocation = (inputData = {}) => {
  if (inputData.latitude !== undefined && inputData.longitude !== undefined) {
    return {
      type: "Point",
      coordinates: [Number(inputData.longitude), Number(inputData.latitude)],
    };
  }

  return inputData.location;
};

const isValidLocation = (location) => {
  const coordinates = location?.coordinates;
  return location?.type === "Point" && Array.isArray(coordinates) &&
    coordinates.length === 2 && coordinates.every(Number.isFinite) &&
    coordinates[0] >= -180 && coordinates[0] <= 180 &&
    coordinates[1] >= -90 && coordinates[1] <= 90;
};

const validatePrediction = (prediction) => {
  if (!isValidLocation(prediction.location)) {
    const error = new Error("A valid prediction location is required");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isFinite(prediction.probability) || prediction.probability < 0 || prediction.probability > 1) {
    const error = new Error("Prediction probability must be between 0 and 1");
    error.statusCode = 400;
    throw error;
  }

  if (prediction.confidence !== null &&
      (!Number.isFinite(prediction.confidence) || prediction.confidence < 0 || prediction.confidence > 1)) {
    const error = new Error("Prediction confidence must be between 0 and 1");
    error.statusCode = 400;
    throw error;
  }

  return prediction;
};

const buildFallbackPrediction = (inputData = {}) => {
  const disasterType = inputData.hazard || inputData.disasterType || "landslide";
  let probability = Number(inputData.probability);

  // If probability wasn't directly provided, compute from rainfall, slope and geotechnical factors
  if (!Number.isFinite(probability)) {
    const rain24h = Number(inputData.rainfall_24h_mm || inputData.rainfall24h || 50);
    const threshold = Number(inputData.threshold || 100);
    const slope = Number(inputData.slope_angle_deg || inputData.slopeAngle || 35);
    const soilMoisture = Number(inputData.soil_moisture_pct || inputData.soilSaturation || 60);

    const rainRatio = Math.min(rain24h / threshold, 1.8) * 0.40;
    const slopeRatio = Math.min(slope / 60, 1.2) * 0.35;
    const soilRatio = (soilMoisture / 100) * 0.25;
    probability = Number(Math.min(Math.max(rainRatio + slopeRatio + soilRatio, 0.05), 0.99).toFixed(2));
  }

  let riskLevel = "low";
  if (probability >= 0.8) riskLevel = "critical";
  else if (probability >= 0.65) riskLevel = "high";
  else if (probability >= 0.45) riskLevel = "medium";

  const recommendations =
    riskLevel === "critical"
      ? [
          "Initiate immediate preemptive evacuation for downslope communities.",
          "Restrict all heavy vehicle movement on vulnerable highway corridors.",
          "Pre-position excavators, SDRF emergency responders, and medical units.",
        ]
      : riskLevel === "high"
      ? [
          "Issue public alert for steep hill slopes and road cutting sectors.",
          "Activate continuous automated pore-pressure and tilt monitoring.",
          "Inspect drainage channels and road culverts for debris clogging.",
        ]
      : [
          "Standard baseline geological monitoring.",
          "Maintain clear drainage along hill roads.",
          "Verify telemetry and rain gauge sensors.",
        ];

  return {
    disasterType,
    riskLevel,
    probability,
    confidence: 0.88,
    modelName: "Mohr-Coulomb Geotechnical & Threshold Baseline",
    modelVersion: "2.1.0",
    recommendations,
    inputData,
  };
};

const generatePrediction = async (inputData = {}) => {
  const payload = {
    ...inputData,
    hazard: inputData.hazard || inputData.disasterType || "landslide",
    source: "disaster_management_backend",
  };

  try {
    const response = await axios.post(
      `${getAiBaseUrl().replace(/\/$/, "")}/predict`,
      payload,
      {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const modelOutput = response?.data || {};

    return {
      disasterType: modelOutput.disasterType || inputData.hazard || inputData.disasterType || "landslide",
      location: modelOutput.location || normalizeLocation(inputData),
      riskLevel: modelOutput.riskLevel || inputData.riskLevel || "medium",
      probability: Number(modelOutput.probability ?? inputData.probability ?? 0.55),
      confidence: Number(modelOutput.confidence ?? 0.85),
      modelName: modelOutput.modelName || "external-ai-model",
      modelVersion: modelOutput.modelVersion || "1.0.0",
      validUntil: modelOutput.validUntil ? new Date(modelOutput.validUntil) : null,
      recommendations: Array.isArray(modelOutput.recommendations)
        ? modelOutput.recommendations
        : buildFallbackPrediction(inputData).recommendations,
      inputData: inputData,
    };
  } catch (error) {
    return {
      ...buildFallbackPrediction(inputData),
      location: normalizeLocation(inputData),
      validUntil: null,
      inputData,
      fallback: true,
    };
  }
};

const createPrediction = async (predictionData) => {
  const generated = await generatePrediction(predictionData);
  validatePrediction(generated);
  const prediction = await Prediction.create({
    ...generated,
    location: generated.location,
  });

  return prediction;
};

const getPredictions = async (filters = {}) => {
  const { disasterType, riskLevel, page = 1, limit = 50 } = filters;
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const query = {};
  if (disasterType) query.disasterType = disasterType;
  if (riskLevel) query.riskLevel = riskLevel;
  return Prediction.find(query)
    .sort({ createdAt: -1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit);
};

const runPredictions = async () => {
  let stations = [];
  try {
    const weatherService = require("./weatherService");
    stations = weatherService.NER_STATIONS || [];
  } catch {}

  if (stations.length === 0) {
    stations = [
      { stationId: "NER-SK-01", stationName: "Gangtok & Mangan Hill Basin", state: "Sikkim", district: "East Sikkim", corridor: "NH-10", latitude: 27.3389, longitude: 88.6065, threshold24hMm: 120.0 },
      { stationId: "NER-ML-01", stationName: "Cherrapunji Gauge", state: "Meghalaya", district: "East Khasi Hills", corridor: "Sohra-Shella Ridge", latitude: 25.2702, longitude: 91.7323, threshold24hMm: 150.0 },
      { stationId: "NER-NL-01", stationName: "Phesama Sector", state: "Nagaland", district: "Kohima", corridor: "NH-29", latitude: 25.6741, longitude: 94.0256, threshold24hMm: 90.0 },
    ];
  }

  const createdPredictions = [];
  const weatherService = require("./weatherService");

  for (const station of stations) {
    try {
      const cached = weatherService.latestStationCache?.get(station.stationId);
      const rain24h = cached?.rolling?.rain24h || 45;
      const rain72h = cached?.rolling?.rain72h || 95;
      const soilMoisture = cached?.riskIndicators?.antecedentMoistureIndex
        ? Math.round(cached.riskIndicators.antecedentMoistureIndex * 100)
        : 65;

      const modelConfig = {
        hazard: "landslide",
        disasterType: "landslide",
        location: {
          type: "Point",
          coordinates: [station.longitude, station.latitude],
        },
        rainfall_24h_mm: rain24h,
        rainfall_72h_mm: rain72h,
        threshold: station.threshold24hMm || 100,
        slope_angle_deg: 38,
        soil_moisture_pct: soilMoisture,
        region: station.stationName,
        district: station.district,
        state: station.state,
        corridor: station.corridor,
        inputData: {
          source: "scheduled-job",
          stationId: station.stationId,
          checkedAt: new Date().toISOString(),
        },
      };

      const prediction = await generatePrediction(modelConfig);
      if (isValidLocation(prediction.location)) {
        validatePrediction(prediction);
        const saved = await Prediction.create({
          ...prediction,
          location: prediction.location,
        });
        createdPredictions.push(saved);
      }
    } catch (err) {
      console.warn(`[PredictionService] Sector prediction note for ${station.stationId}:`, err.message);
    }
  }

  console.log(`[PredictionService] Landslide prediction cycle completed for ${createdPredictions.length} sectors.`);
  return createdPredictions.length > 0 ? createdPredictions[0] : null;
};

module.exports = {
  createPrediction,
  getPredictions,
  generatePrediction,
  runPredictions,
};