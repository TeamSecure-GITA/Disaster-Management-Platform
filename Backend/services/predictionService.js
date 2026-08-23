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
  const disasterType = inputData.disasterType || "flood";
  const riskLevel = inputData.riskLevel || "medium";
  const probability = inputData.probability || 0.55;

  return {
    disasterType,
    riskLevel,
    probability,
    confidence: 0.7,
    modelName: "fallback-rule-based",
    modelVersion: "1.0.0",
    recommendations: [
      "Alert local response teams.",
      "Verify sensor and weather data before escalation.",
      "Prepare evacuation support if conditions worsen.",
    ],
    inputData,
  };
};

const generatePrediction = async (inputData = {}) => {
  const payload = {
    ...inputData,
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
      disasterType: modelOutput.disasterType || inputData.disasterType || "flood",
      location: modelOutput.location || normalizeLocation(inputData),
      riskLevel: modelOutput.riskLevel || inputData.riskLevel || "medium",
      probability: Number(modelOutput.probability ?? inputData.probability ?? 0.55),
      confidence: Number(modelOutput.confidence ?? 0.7),
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
  const modelConfig = {
    disasterType: "flood",
    riskLevel: "medium",
    probability: 0.6,
    inputData: {
      source: "scheduled-job",
      checkedAt: new Date().toISOString(),
    },
  };

  const prediction = await generatePrediction(modelConfig);
  if (!isValidLocation(prediction.location)) return null;
  return Prediction.create({
    ...prediction,
    location: prediction.location,
  });
};

module.exports = {
  createPrediction,
  getPredictions,
  generatePrediction,
  runPredictions,
};