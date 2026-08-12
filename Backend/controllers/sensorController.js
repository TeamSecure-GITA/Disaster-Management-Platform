const sensorService = require("../services/sensorService");

const createSensor = async (req, res, next) => {
  try {
    const sensor = await sensorService.createSensor(req.body);

    res.status(201).json({
      success: true,
      message: "Sensor created successfully",
      data: sensor,
    });
  } catch (error) {
    next(error);
  }
};

const addSensorReading = async (req, res, next) => {
  try {
    const reading = await sensorService.addSensorReading(req.body);

    res.status(201).json({
      success: true,
      message: "Sensor reading added successfully",
      data: reading,
    });
  } catch (error) {
    next(error);
  }
};

const getSensorReadings = async (req, res, next) => {
  try {
    const readings =
      await sensorService.getSensorReadings(req.params.sensorId);

    res.status(200).json({
      success: true,
      data: readings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSensor,
  addSensorReading,
  getSensorReadings,
};