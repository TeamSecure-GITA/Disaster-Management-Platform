const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { operationsOnly } = require("../middleware/adminMiddleware");

const {
  createSensor,
  addSensorReading,
  getSensorReadings,
} = require("../controllers/sensorController");

const router = express.Router();

router.post("/", protect, operationsOnly, createSensor);

router.post(
  "/readings",
  protect,
  operationsOnly,
  addSensorReading
);

router.get(
  "/:sensorId/readings",
  getSensorReadings
);

module.exports = router;