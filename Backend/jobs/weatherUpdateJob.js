const cron = require("node-cron");
const weatherService = require("../services/weatherService");

const startWeatherUpdateJob = () => {
  // Runs every 30 minutes
  cron.schedule("*/30 * * * *", async () => {
    try {
      console.log("Updating weather data...");

      if (
        weatherService &&
        typeof weatherService.updateWeatherData === "function"
      ) {
        await weatherService.updateWeatherData();
      }

      console.log("Weather update completed");
    } catch (error) {
      console.error(
        "Weather update job error:",
        error.message
      );
    }
  });

  console.log("Weather update job started");
};

module.exports = startWeatherUpdateJob;