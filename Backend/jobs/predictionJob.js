const cron = require("node-cron");
const predictionService = require("../services/predictionService");

const startPredictionJob = () => {
  // Runs every hour
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("Running disaster predictions...");

      if (
        predictionService &&
        typeof predictionService.runPredictions === "function"
      ) {
        await predictionService.runPredictions();
      }

      console.log("Prediction job completed");
    } catch (error) {
      console.error(
        "Prediction job error:",
        error.message
      );
    }
  });

  console.log("Prediction job started");
};

module.exports = startPredictionJob;