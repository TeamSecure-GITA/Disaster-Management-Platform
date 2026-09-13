const cron = require("node-cron");
const crowdSignalService = require("../services/crowdSignalService");

const startCrowdSignalJob = () => {
  // Run volume anomaly scan every 2 minutes
  const cronSchedule = process.env.CROWD_SIGNAL_CRON || "*/2 * * * *";

  const task = cron.schedule(cronSchedule, async () => {
    try {
      console.log("[CrowdSignalJob] 🔍 Scanning social media streams for keyword volume anomalies...");
      const signals = await crowdSignalService.scanCrowdSignalsAndAnomalies();
      if (signals.length > 0) {
        console.log(`[CrowdSignalJob] 🔥 Caught ${signals.length} situational volume surge(s) from social streams.`);
      }
    } catch (error) {
      console.error("[CrowdSignalJob] Scan error:", error.message);
    }
  });

  // Initial scan on startup after 15s delay
  setTimeout(async () => {
    try {
      console.log("[CrowdSignalJob] Running initial social anomaly scan...");
      await crowdSignalService.scanCrowdSignalsAndAnomalies();
    } catch (err) {
      console.warn("[CrowdSignalJob] Initial scan warning:", err.message);
    }
  }, 15000);

  console.log(`[CrowdSignalJob] Started (schedule: ${cronSchedule})`);
  return task;
};

module.exports = startCrowdSignalJob;
