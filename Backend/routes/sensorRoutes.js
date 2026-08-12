const express = require("express");

const {
  createSensor,
  addSensorReading,
  getSensorReadings,
} = require("../controllers/sensorController");

const router = express.Router();

router.post("/", createSensor);

router.post(
  "/readings",
  addSensorReading
);

router.get(
  "/:sensorId/readings",
  getSensorReadings
);

module.exports = router;