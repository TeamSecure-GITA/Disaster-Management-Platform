const express = require("express");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { operationsOnly } = require("../middleware/adminMiddleware");

const {
  getAllSensors,
  getSensorById,
  getSensorSummary,
  getSensorAnomalies,
  createSensor,
  addSensorReading,
  getSensorReadings,
  ingestGateway,
} = require("../controllers/sensorController");

const router = express.Router();

// GET /api/sensors - Retrieve all sensors with optional filters (state, type, corridor)
router.get("/", getAllSensors);

// GET /api/sensors/summary - Overall sensor network health, active nodes, by type/state
router.get("/summary", getSensorSummary);

// GET /api/sensors/anomalies - Real-time anomalous slope & sensor alerts
router.get("/anomalies", getSensorAnomalies);

// Device Gateway Ingest Endpoints (LoRaWAN / GSM / GPRS / IoT Gateways)
router.post("/gateway/ingest", ingestGateway);
router.post("/gateway/lora", ingestGateway);
router.post("/gateway/gsm", express.text({ type: ["text/plain", "application/x-www-form-urlencoded"] }), ingestGateway);

// Manual or Admin Ingest
router.post("/", protect, operationsOnly, createSensor);
router.post("/readings", optionalAuth, addSensorReading);

// Specific Sensor routes
router.get("/:id", getSensorById);
router.get("/:sensorId/readings", getSensorReadings);

module.exports = router;