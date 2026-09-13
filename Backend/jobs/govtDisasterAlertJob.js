const cron = require("node-cron");
const govtAlertService = require("../services/govtAlertService");

const startGovtDisasterAlertJob = () => {
  // Poll official programmatic feeds every 1 minute to catch seismic & nowcast events instantly
  const cronSchedule = process.env.GOVT_ALERT_CRON || "* * * * *";

  const task = cron.schedule(cronSchedule, async () => {
    try {
      console.log("[GovtDisasterAlertJob] ⚡ Polling GDACS, NDMA SACHET & USGS 60s feeds for early warnings...");
      const result = await govtAlertService.fetchAndSyncGovtAlerts();
      if (result.newAlertsCount > 0) {
        console.log(`[GovtDisasterAlertJob] 🚨 Instant Early Warning: Broadcasted ${result.newAlertsCount} new disaster alert(s) to citizens.`);
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
