const Prediction = require("../models/Prediction");

const createPrediction = async (predictionData) => {
  return await Prediction.create(predictionData);
};

const getPredictions = async (filters = {}) => {
  return await Prediction.find(filters).sort({ createdAt: -1 });
};

module.exports = {
  createPrediction,
  getPredictions,
};