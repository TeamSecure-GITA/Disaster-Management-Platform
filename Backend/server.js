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
  jobTasks.forEach((task) => task?.stop?.());
  io?.close?.();

  await Promise.race([
    new Promise((resolve) => server.close(resolve)),
    new Promise((resolve) => setTimeout(resolve, 3000)),
  ]);
  server.closeAllConnections?.();
  await disconnectDatabase();
};

const start = async () => {
  await connectDatabase();
  startServerRuntime();

  await new Promise((resolve, reject) => {
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `\n❌ Port ${PORT} is already in use by another process.` +
          `\n👉 Quick fix options:` +
          `\n   1. Free port ${PORT}: run 'npx kill-port ${PORT}' or 'fuser -k ${PORT}/tcp'` +
          `\n   2. Or change PORT in Backend/.env (e.g., PORT=5001)\n`
        );
      }
      reject(error);
    });

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      resolve(server);
    });
  });

  return server;
};

if (require.main === module) {
  start().catch((error) => {
    if (error.code !== "EADDRINUSE") {
      console.error("Server startup error:", error.message);
    }
    process.exitCode = 1;
  });

  process.once("SIGINT", () => stopServer("SIGINT"));
  process.once("SIGTERM", () => stopServer("SIGTERM"));
  process.once("SIGUSR2", async () => {
    await stopServer("SIGUSR2");
    process.kill(process.pid, "SIGUSR2");
  });
}

module.exports = app;
module.exports.start = start;
module.exports.stopServer = stopServer;