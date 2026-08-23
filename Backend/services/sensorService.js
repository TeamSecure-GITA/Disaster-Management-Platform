const Sensor = require("../models/Sensor");
const SensorReading = require("../models/SensorReading");
const { emitSensorReading } = require("../sockets/sensorSocket");

const createSensor = async (sensorData) => {
  return await Sensor.create(sensorData);
};

const addSensorReading = async (readingData) => {
  const reading = await SensorReading.create(readingData);
  emitSensorReading(reading);
  return reading;
};

const getSensorReadings = async (sensorId) => {
  return await SensorReading.find({
    sensor: sensorId,
  }).sort({ createdAt: -1 });
};

module.exports = {
  createSensor,
  addSensorReading,
  getSensorReadings,
};