require("dotenv").config();

const http = require("http");

const app = require("./app");
const { connectDatabase } = require("./config/database");
const { initializeSocket } = require("./sockets/socket");
const startNotificationJob = require("./jobs/notificationJob");
const startPredictionJob = require("./jobs/predictionJob");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const startServerRuntime = () => {
  initializeSocket(server);
  startNotificationJob();
  startPredictionJob();
};

connectDatabase()
  .then(() => {
    if (require.main === module) {
      startServerRuntime();
      server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    }
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

module.exports = app;