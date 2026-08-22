const axios = require("axios");
const Prediction = require("../models/Prediction");

const getAiBaseUrl = () => process.env.AI_CHATBOT_URL || "http://localhost:8000";

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
      location: modelOutput.location || inputData.location || { type: "Point", coordinates: [0, 0] },
      riskLevel: modelOutput.riskLevel || inputData.riskLevel || "medium",
      probability: Number(modelOutput.probability ?? inputData.probability ?? 0.55),
      confidence: Number(modelOutput.confidence ?? 0.7),
      modelName: modelOutput.modelName || "external-ai-model",
      modelVersion: modelOutput.modelVersion || "1.0.0",
      validUntil: modelOutput.validUntil ? new Date(modelOutput.validUntil) : null,
      recommendations: modelOutput.recommendations || buildFallbackPrediction(inputData).recommendations,
      inputData: inputData,
    };
  } catch (error) {
    return {
      ...buildFallbackPrediction(inputData),
      location: inputData.location || { type: "Point", coordinates: [0, 0] },
      validUntil: null,
      inputData,
      fallback: true,
      error: error?.response?.data || error.message,
    };
  }
};

const createPrediction = async (predictionData) => {
  const generated = await generatePrediction(predictionData);
  const prediction = await Prediction.create({
    ...generated,
    location: generated.location || { type: "Point", coordinates: [0, 0] },
  });

  return prediction;
};

const getPredictions = async (filters = {}) => {
  return await Prediction.find(filters).sort({ createdAt: -1 });
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
  return Prediction.create({
    ...prediction,
    location: prediction.location || { type: "Point", coordinates: [0, 0] },
  });
};

module.exports = {
  createPrediction,
  getPredictions,
  generatePrediction,
  runPredictions,
};