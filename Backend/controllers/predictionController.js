const predictionService = require("../services/predictionService");
const environment = require("../config/environment");

const createPrediction = async (req, res, next) => {
  try {
    const prediction =
      await predictionService.createPrediction(req.body);

    res.status(201).json({
      success: true,
      message: "Prediction created successfully",
      data: prediction,
    });
  } catch (error) {
    next(error);
  }
};

const getPredictions = async (req, res, next) => {
  try {
    const predictions =
      await predictionService.getPredictions(req.query);

    res.status(200).json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    next(error);
  }
};

const getPredictionStatus = async (req, res, next) => {
  try {
    const status = {
      aiServiceUrl: environment.aiChatbotUrl,
      hasExternalAi: Boolean(process.env.AI_CHATBOT_URL),
      modelFallbackEnabled: true,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPrediction,
  getPredictions,
  getPredictionStatus,
};