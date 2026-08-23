const cron = require("node-cron");
const satelliteService = require("../services/satelliteService");

const startSatelliteUpdateJob = () => {
  // Runs every 6 hours
  const task = cron.schedule("0 */6 * * *", async () => {
    try {
      console.log("Updating satellite data...");

      if (
        satelliteService &&
        typeof satelliteService.updateSatelliteData === "function"
      ) {
        await satelliteService.updateSatelliteData();
      }

      console.log("Satellite update completed");
    } catch (error) {
      console.error(
        "Satellite update job error:",
        error.message
      );
    }
  });

  console.log("Satellite update job started");
  return task;
};

module.exports = startSatelliteUpdateJob;