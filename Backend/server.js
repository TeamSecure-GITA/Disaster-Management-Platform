const http = require("http");

const app = require("./app");
const { connectDatabase, disconnectDatabase } = require("./config/database");
const { initializeSocket } = require("./sockets/socket");
const startNotificationJob = require("./jobs/notificationJob");
const startPredictionJob = require("./jobs/predictionJob");
const startAlertExpiryJob = require("./jobs/alertExpiryJob");
const startSatelliteUpdateJob = require("./jobs/satelliteUpdateJob");
const startWeatherUpdateJob = require("./jobs/weatherUpdateJob");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
let io;
let jobTasks = [];
let shuttingDown = false;

const startServerRuntime = () => {
  io = initializeSocket(server);
  jobTasks = [
    startNotificationJob(),
    startPredictionJob(),
    startAlertExpiryJob(),
    startSatelliteUpdateJob(),
    startWeatherUpdateJob(),
  ];
};

const stopServer = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`Received ${signal}; shutting down gracefully...`);
  jobTasks.forEach((task) => task?.stop());
  io?.close();

  await Promise.race([
    new Promise((resolve) => server.close(resolve)),
    new Promise((resolve) => setTimeout(resolve, 10000)),
  ]);
  server.closeAllConnections?.();
  await disconnectDatabase();
};

const start = async () => {
  await connectDatabase();
  startServerRuntime();

  await new Promise((resolve) => {
    server.listen(PORT, resolve);
  });

  console.log(`Server running on http://localhost:${PORT}`);
  return server;
};

if (require.main === module) {
  start().catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exitCode = 1;
  });

  process.once("SIGINT", () => stopServer("SIGINT"));
  process.once("SIGTERM", () => stopServer("SIGTERM"));
}

module.exports = app;
module.exports.start = start;
module.exports.stopServer = stopServer;