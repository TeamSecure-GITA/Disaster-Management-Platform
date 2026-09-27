const cron = require("node-cron");
const satelliteService = require("../services/satelliteService");

const startSatelliteUpdateJob = () => {
  // Trigger initial satellite processing on startup asynchronously
  setTimeout(async () => {
    try {
      console.log("[SatelliteJob] Executing initial startup satellite remote sensing sync...");
      if (satelliteService && typeof satelliteService.updateSatelliteData === "function") {
        await satelliteService.updateSatelliteData();
      }
      console.log("[SatelliteJob] Initial satellite sync completed");
    } catch (err) {
      console.error("[SatelliteJob] Initial satellite sync error:", err.message);
    }
  }, 2000);

  // Runs every 6 hours: 00:00, 06:00, 12:00, 18:00
  const task = cron.schedule("0 */6 * * *", async () => {
    try {
      console.log("[SatelliteJob] 6-hourly satellite update starting...");

      if (
        satelliteService &&
        typeof satelliteService.updateSatelliteData === "function"
      ) {
        await satelliteService.updateSatelliteData();
      }

      console.log("[SatelliteJob] 6-hourly satellite update completed");
    } catch (error) {
      console.error(
        "[SatelliteJob] Satellite update job error:",
        error.message
      );
    }
  });

  console.log("Satellite update job started (6-hourly cycle + initial startup sync)");
  return task;
};

module.exports = startSatelliteUpdateJob;