const cron = require("node-cron");
const govtAlertService = require("../services/govtAlertService");

const startGovtDisasterAlertJob = () => {
  // Poll official disaster & weather portals every 2 minutes: "*/2 * * * *"
  const cronSchedule = process.env.GOVT_ALERT_CRON || "*/2 * * * *";

  const task = cron.schedule(cronSchedule, async () => {
    try {
      console.log("[GovtDisasterAlertJob] Checking official disaster and weather warning sources...");
      const result = await govtAlertService.fetchAndSyncGovtAlerts();
      if (result.newAlertsCount > 0) {
        console.log(`[GovtDisasterAlertJob] 🚨 Broadcasted ${result.newAlertsCount} new disaster/weather alert(s) to users.`);
      }
    } catch (error) {
      console.error("[GovtDisasterAlertJob] Job execution error:", error.message);
    }
  });

  // Also run an initial sync on startup after a small delay (10 seconds)
  setTimeout(async () => {
    try {
      console.log("[GovtDisasterAlertJob] Running initial sync of official government feeds...");
      await govtAlertService.fetchAndSyncGovtAlerts();
    } catch (err) {
      console.warn("[GovtDisasterAlertJob] Initial sync warning:", err.message);
    }
  }, 10000);

  console.log(`[GovtDisasterAlertJob] Started (schedule: ${cronSchedule})`);
  return task;
};

module.exports = startGovtDisasterAlertJob;
