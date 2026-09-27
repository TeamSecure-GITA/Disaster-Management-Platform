const cron = require("node-cron");
const weatherService = require("../services/weatherService");

const startWeatherUpdateJob = () => {
  // Initial immediate run on startup (after brief delay for DB/sockets initialization)
  setTimeout(async () => {
    try {
      console.log("[WeatherUpdateJob] Performing initial rainfall & weather sync...");
      if (
        weatherService &&
        typeof weatherService.updateWeatherData === "function"
      ) {
        await weatherService.updateWeatherData();
      }
    } catch (err) {
      console.warn("[WeatherUpdateJob] Initial update error:", err.message);
    }
  }, 4000);

  // Runs every 30 minutes
  const task = cron.schedule("*/30 * * * *", async () => {
    try {
      console.log("[WeatherUpdateJob] Scheduled 30-minute weather update executing...");

      if (
        weatherService &&
        typeof weatherService.updateWeatherData === "function"
      ) {
        await weatherService.updateWeatherData();
      }

      console.log("[WeatherUpdateJob] Weather update completed successfully");
    } catch (error) {
      console.error(
        "[WeatherUpdateJob] Weather update job error:",
        error.message
      );
    }
  });

  console.log("Weather update job started (30m interval + immediate startup sync)");
  return task;
};

module.exports = startWeatherUpdateJob;