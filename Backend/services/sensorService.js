const Sensor = require("../models/Sensor");
const SensorReading = require("../models/SensorReading");

const createSensor = async (sensorData) => {
  return await Sensor.create(sensorData);
};

const addSensorReading = async (readingData) => {
  return await SensorReading.create(readingData);
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