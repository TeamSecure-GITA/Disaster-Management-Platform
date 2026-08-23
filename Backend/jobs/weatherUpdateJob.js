const cron = require("node-cron");
const weatherService = require("../services/weatherService");

const startWeatherUpdateJob = () => {
  // Runs every 30 minutes
  const task = cron.schedule("*/30 * * * *", async () => {
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
  return task;
};

module.exports = startWeatherUpdateJob;