/**
 * landslideAlertJob.js
 *
 * Cron schedules:
 *  • Every 5 minutes  → checkAndGenerateLandslideAlerts()
 *    Reads all risk zones from riskEngineService, fires alerts on threshold crossings.
 *
 *  • Every 5 minutes  → runEscalationPass()
 *    Checks unacknowledged authority alerts past SLA and escalates up the chain.
 */

"use strict";

const cron = require("node-cron");
const { checkAndGenerateLandslideAlerts } = require("../services/landslideAlertService");
const { runEscalationPass }               = require("../services/alertEscalationService");

const startLandslideAlertJob = () => {
  // ── Landslide risk threshold watcher ─────────────────────────────────────
  const alertSchedule = process.env.LANDSLIDE_ALERT_CRON || "*/5 * * * *";

  const alertTask = cron.schedule(alertSchedule, async () => {
    try {
      const results = await checkAndGenerateLandslideAlerts();
      if (results.length) {
        console.log(
          `[LandslideAlertJob] 🌋 ${results.length} alert(s) generated`,
          results.map((r) => `${r.zoneId}→${r.level}(${r.targetedUsers} recipients)`).join(" | ")
        );
      }
    } catch (err) {
      console.error("[LandslideAlertJob] Alert generation error:", err.message);
    }
  });

  // ── Escalation watcher ────────────────────────────────────────────────────
  const escSchedule = process.env.ESCALATION_CRON || "*/5 * * * *";

  const escTask = cron.schedule(escSchedule, async () => {
    try {
      const results = await runEscalationPass();
      if (results.length) {
        console.log(
          `[LandslideAlertJob] 🔺 ${results.length} alert(s) escalated`,
          results.map((r) => `${r.alertId}→${r.escalatedTo}`).join(" | ")
        );
      }
    } catch (err) {
      console.error("[LandslideAlertJob] Escalation error:", err.message);
    }
  });

  // ── Initial pass on startup (15-second delay) ─────────────────────────────
  setTimeout(async () => {
    try {
      await checkAndGenerateLandslideAlerts();
      await runEscalationPass();
    } catch (err) {
      console.warn("[LandslideAlertJob] Startup pass warning:", err.message);
    }
  }, 15000);

  console.log(
    `[LandslideAlertJob] Started – alert: ${alertSchedule}, escalation: ${escSchedule}`
  );

  return { alertTask, escTask };
};

module.exports = startLandslideAlertJob;
