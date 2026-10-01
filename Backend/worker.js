/**
 * worker.js  –  Dedicated Background Worker Process
 *
 * Runs scheduled cron jobs, data sync tasks, and the alert fan-out queue
 * in an isolated worker process decoupled from the HTTP API servers.
 *
 * Architecture Benefit:
 *   - The API process can scale horizontally (2, 4, 10+ replicas) without
 *     duplicating cron executions or alert deliveries.
 *   - Heavy prediction/satellite data fetches run independently of incoming
 *     user HTTP requests and WebSocket traffic.
 */

"use strict";

const dotenv = require("dotenv");
dotenv.config();

const { connectDatabase, disconnectDatabase } = require("./config/database");
const startNotificationJob = require("./jobs/notificationJob");
const startPredictionJob = require("./jobs/predictionJob");
const startAlertExpiryJob = require("./jobs/alertExpiryJob");
const startSatelliteUpdateJob = require("./jobs/satelliteUpdateJob");
const startWeatherUpdateJob = require("./jobs/weatherUpdateJob");
const startGovtDisasterAlertJob = require("./jobs/govtDisasterAlertJob");
const startCrowdSignalJob = require("./jobs/crowdSignalJob");
const { startNewsFetcherJob } = require("./jobs/newsFetcher");
const { startMeshHealthJob } = require("./jobs/meshHealthJob");
const startLandslideAlertJob = require("./jobs/landslideAlertJob");
const { alertQueue } = require("./services/alertQueue");

let jobTasks = [];
let shuttingDown = false;

async function startWorker() {
  console.log("==================================================");
  console.log("   DMP BACKGROUND CRON & ALERT QUEUE WORKER");
  console.log("==================================================");

  try {
    await connectDatabase();
    console.log("[Worker] MongoDB connection established.");

    // Start all scheduled cron jobs
    jobTasks = [
      startNotificationJob(),
      startPredictionJob(),
      startAlertExpiryJob(),
      startSatelliteUpdateJob(),
      startWeatherUpdateJob(),
      startGovtDisasterAlertJob(),
      startCrowdSignalJob(),
    ];

    startNewsFetcherJob();
    startMeshHealthJob();

    const { alertTask, escTask } = startLandslideAlertJob();
    if (alertTask) jobTasks.push(alertTask);
    if (escTask) jobTasks.push(escTask);

    console.log(`[Worker] Started ${jobTasks.length} background cron schedules.`);

    // Start the alert fanout queue processor
    alertQueue.startProcessing();
    console.log("[Worker] Alert fanout queue processor active.");
  } catch (err) {
    console.error("[Worker] Fatal startup error:", err);
    process.exit(1);
  }
}

async function stopWorker(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`\n[Worker] Received ${signal}; shutting down gracefully...`);

  // Stop cron tasks
  jobTasks.forEach((task) => {
    task?.stop?.();
  });

  // Stop alert queue
  alertQueue.stopProcessing();

  // Disconnect MongoDB
  await disconnectDatabase();

  console.log("[Worker] Background worker stopped cleanly.");
  process.exit(0);
}

process.on("SIGINT", () => stopWorker("SIGINT"));
process.on("SIGTERM", () => stopWorker("SIGTERM"));

startWorker();
