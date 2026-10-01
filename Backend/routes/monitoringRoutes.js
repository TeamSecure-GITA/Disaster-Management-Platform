/**
 * monitoringRoutes.js
 *
 * Exposes production observability endpoints:
 *   1. GET /metrics                – Prometheus exposition format
 *   2. GET /api/monitoring/metrics – JSON metrics for dashboards & monitoring agents
 *   3. GET /api/monitoring/health  – Deep dependency health check (Mongo ping, memory, queue)
 */

"use strict";

const express = require("express");
const mongoose = require("mongoose");
const { alertQueue } = require("../services/alertQueue");

const router = express.Router();
const startTime = Date.now();

// ─── GET /api/monitoring/health ───────────────────────────────────────────────

const getHealthStatus = () => {
  const mongoStatus = mongoose.connection.readyState;
  const isMongoHealthy = mongoStatus === 1;
  const mem = process.memoryUsage();
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  return {
    isMongoHealthy,
    body: {
      status: isMongoHealthy ? "healthy" : "degraded",
      database: {
        status: isMongoHealthy ? "healthy" : "unhealthy",
        state: ["disconnected", "connected", "connecting", "disconnecting"][mongoStatus] || "unknown",
      },
      checks: {
        database: {
          status: isMongoHealthy ? "healthy" : "unhealthy",
          state: ["disconnected", "connected", "connecting", "disconnecting"][mongoStatus] || "unknown",
        },
        memory: {
          rssMb: Math.round(mem.rss / (1024 * 1024)),
          heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
          heapTotalMb: Math.round(mem.heapTotal / (1024 * 1024)),
        },
        uptime: uptimeSeconds,
        timestamp: new Date().toISOString(),
      },
    },
  };
};

router.get("/health", (req, res) => {
  const health = getHealthStatus();
  const statusCode = health.isMongoHealthy ? 200 : 503;
  res.status(statusCode).json(health.body);
});

// Helper for Prometheus text format
const generatePrometheusMetrics = async () => {
  const queueStats = await alertQueue.getMetrics();
  const mem = process.memoryUsage();
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const mongoStatus = mongoose.connection.readyState === 1 ? 1 : 0;
  const cpuUsage = process.cpuUsage();
  const cpuSeconds = (cpuUsage.user + cpuUsage.system) / 1e6;

  return [
    "# HELP process_cpu_seconds_total Total user and system CPU time spent in seconds",
    "# TYPE process_cpu_seconds_total counter",
    `process_cpu_seconds_total ${cpuSeconds.toFixed(4)}`,
    "",
    "# HELP dmp_process_uptime_seconds Process uptime in seconds",
    "# TYPE dmp_process_uptime_seconds counter",
    `dmp_process_uptime_seconds ${uptimeSeconds}`,
    "",
    "# HELP process_resident_memory_bytes Resident memory size in bytes",
    "# TYPE process_resident_memory_bytes gauge",
    `process_resident_memory_bytes ${mem.rss}`,
    "",
    "# HELP nodejs_heap_size_used_bytes Heap memory used in bytes",
    "# TYPE nodejs_heap_size_used_bytes gauge",
    `nodejs_heap_size_used_bytes ${mem.heapUsed}`,
    "",
    "# HELP nodejs_heap_size_total_bytes Total allocated heap memory in bytes",
    "# TYPE nodejs_heap_size_total_bytes gauge",
    `nodejs_heap_size_total_bytes ${mem.heapTotal}`,
    "",
    "# HELP mongodb_up MongoDB connection status (1=up, 0=down)",
    "# TYPE mongodb_up gauge",
    `mongodb_up ${mongoStatus}`,
    "",
    "# HELP alert_queue_pending_jobs Pending alert fanout jobs count in queue",
    "# TYPE alert_queue_pending_jobs gauge",
    `alert_queue_pending_jobs ${queueStats.queueDepth}`,
    "",
    "# HELP alert_queue_dispatched_total Total alert notifications successfully dispatched",
    "# TYPE alert_queue_dispatched_total counter",
    `alert_queue_dispatched_total ${queueStats.totalDispatched}`,
    "",
    "# HELP alert_queue_failed_total Total alert notifications failed",
    "# TYPE alert_queue_failed_total counter",
    `alert_queue_failed_total ${queueStats.totalFailed}`,
    "",
  ].join("\n");
};

// Root route (for when mounted at /metrics)
router.get("/", async (req, res) => {
  const acceptHeader = req.headers.accept || "";
  if (acceptHeader.includes("application/json")) {
    const queueStats = await alertQueue.getMetrics();
    const mem = process.memoryUsage();
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const mongoStatus = mongoose.connection.readyState === 1 ? 1 : 0;
    return res.status(200).json({
      success: true,
      data: {
        uptimeSeconds,
        system: {
          platform: process.platform,
          nodeVersion: process.version,
          arch: process.arch,
        },
        process: {
          pid: process.pid,
          uptime: uptimeSeconds,
        },
        memory: {
          rssBytes: mem.rss,
          heapTotalBytes: mem.heapTotal,
          heapUsedBytes: mem.heapUsed,
        },
        mongodb: {
          connected: mongoStatus === 1,
          readyState: mongoose.connection.readyState,
        },
        alertQueue: queueStats,
        serverTime: new Date().toISOString(),
      },
    });
  }

  const prometheusBody = await generatePrometheusMetrics();
  res.set("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
  return res.status(200).send(prometheusBody);
});

// ─── GET /api/monitoring/metrics (JSON or Prometheus based on query/header) ────

router.get("/metrics", async (req, res) => {
  const acceptHeader = req.headers.accept || "";
  if (acceptHeader.includes("text/plain") || req.query.format === "prometheus") {
    const prometheusBody = await generatePrometheusMetrics();
    res.set("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    return res.status(200).send(prometheusBody);
  }

  const queueStats = await alertQueue.getMetrics();
  const mem = process.memoryUsage();
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const mongoStatus = mongoose.connection.readyState === 1 ? 1 : 0;

  res.status(200).json({
    success: true,
    data: {
      uptimeSeconds,
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        arch: process.arch,
      },
      process: {
        pid: process.pid,
        uptime: uptimeSeconds,
      },
      memory: {
        rssBytes: mem.rss,
        heapTotalBytes: mem.heapTotal,
        heapUsedBytes: mem.heapUsed,
      },
      mongodb: {
        connected: mongoStatus === 1,
        readyState: mongoose.connection.readyState,
      },
      alertQueue: queueStats,
      serverTime: new Date().toISOString(),
    },
  });
});

module.exports = router;

