// Load environment variables FIRST
require("dotenv").config();

const http = require("http");

const app = require("./app");
const {
  connectDatabase,
  disconnectDatabase,
} = require("./config/database");

const { initializeSocket } = require("./sockets/socket");

const startNotificationJob = require("./jobs/notificationJob");
const startPredictionJob = require("./jobs/predictionJob");
const startAlertExpiryJob = require("./jobs/alertExpiryJob");
const startSatelliteUpdateJob = require("./jobs/satelliteUpdateJob");
const startWeatherUpdateJob = require("./jobs/weatherUpdateJob");
const startGovtDisasterAlertJob = require("./jobs/govtDisasterAlertJob");
const { startNewsFetcherJob } = require("./jobs/newsFetcher");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

let io;
let jobTasks = [];
let shuttingDown = false;


// ================================
// START SERVER RUNTIME
// ================================

const startServerRuntime = () => {
  io = initializeSocket(server);

  jobTasks = [
    startNotificationJob(),
    startPredictionJob(),
    startAlertExpiryJob(),
    startSatelliteUpdateJob(),
    startWeatherUpdateJob(),
    startGovtDisasterAlertJob(),
  ];

  // Start news RSS fetcher (runs every 6h + immediately on startup)
  startNewsFetcherJob();
};


// ================================
// GRACEFUL SHUTDOWN
// ================================

const stopServer = async (signal) => {
  if (shuttingDown) return;

  shuttingDown = true;

  console.log(
    `Received ${signal}; shutting down gracefully...`
  );

  // Stop background jobs
  jobTasks.forEach((task) => {
    task?.stop?.();
  });

  // Close Socket.IO
  io?.close?.();

  // Close HTTP server
  await Promise.race([
    new Promise((resolve) => {
      server.close(resolve);
    }),

    new Promise((resolve) => {
      setTimeout(resolve, 3000);
    }),
  ]);

  // Close remaining connections if supported
  server.closeAllConnections?.();

  // Disconnect MongoDB
  await disconnectDatabase();

  console.log("Server shutdown complete");
};


// ================================
// START SERVER
// ================================

const start = async () => {
  try {
    console.log("Starting Disaster Management Platform...");

    // Connect MongoDB Atlas
    await connectDatabase();

    // Start Socket.IO and background jobs
    startServerRuntime();

    // Start HTTP server
    await new Promise((resolve, reject) => {

      server.once("error", (error) => {

        if (error.code === "EADDRINUSE") {
          console.error(
            `\n❌ Port ${PORT} is already in use by another process.` +
            `\n👉 Quick fix options:` +
            `\n   1. Free port ${PORT}: run 'npx kill-port ${PORT}' or 'fuser -k ${PORT}/tcp'` +
            `\n   2. Or change PORT in Backend/.env (example: PORT=5001)\n`
          );
        }

        reject(error);
      });

      server.listen(PORT, () => {

        console.log(
          `Server running on http://localhost:${PORT}`
        );

        resolve(server);
      });
    });

    return server;

  } catch (error) {

    console.error(
      "Server startup error:",
      error.message
    );

    throw error;
  }
};


// ================================
// RUN DIRECTLY
// ================================

if (require.main === module) {

  start().catch((error) => {

    if (error.code !== "EADDRINUSE") {
      console.error(
        "Server startup error:",
        error.message
      );
    }

    process.exitCode = 1;
  });


  // Ctrl + C
  process.once("SIGINT", () => {
    stopServer("SIGINT");
  });


  // Railway / deployment shutdown
  process.once("SIGTERM", () => {
    stopServer("SIGTERM");
  });


  // Nodemon restart
  process.once("SIGUSR2", async () => {

    await stopServer("SIGUSR2");

    process.kill(process.pid, "SIGUSR2");
  });
}


// ================================
// EXPORTS
// ================================

module.exports = app;
module.exports.start = start;
module.exports.stopServer = stopServer;