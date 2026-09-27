const sensorService = require("../services/sensorService");

/**
 * Controller for Environmental & In-Situ Geotechnical Sensors
 */
const getAllSensors = async (req, res, next) => {
  try {
    const { type, status, state, corridor } = req.query;
    const sensors = await sensorService.getAllSensors({
      type,
      status,
      state,
      corridor,
    });

    res.status(200).json({
      success: true,
      count: sensors.length,
      data: sensors,
    });
  } catch (error) {
    next(error);
  }
};

const getSensorById = async (req, res, next) => {
  try {
    const sensor = await sensorService.getSensorById(req.params.id);
    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: "Sensor node not found",
      });
    }

    res.status(200).json({
      success: true,
      data: sensor,
    });
  } catch (error) {
    next(error);
  }
};

const getSensorSummary = async (req, res, next) => {
  try {
    const summary = await sensorService.getSensorSummary();
    res.status(200).json({
      success: true,
      ...summary,
    });
  } catch (error) {
    next(error);
  }
};

const getSensorAnomalies = async (req, res, next) => {
  try {
    const anomalies = await sensorService.getSensorAnomalies();
    res.status(200).json({
      success: true,
      count: anomalies.length,
      data: anomalies,
    });
  } catch (error) {
    next(error);
  }
};

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
    const readings = await sensorService.getSensorReadings(
      req.params.sensorId,
      req.query.limit ? Number(req.query.limit) : 50
    );

    res.status(200).json({
      success: true,
      count: readings.length,
      data: readings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Device Gateway Ingest Handler for GSM / GPRS / LoRa / LoRaWAN
 */
const ingestGateway = async (req, res, next) => {
  try {
    const gatewayId = req.headers["x-gateway-id"] || req.body.gatewayId;
    const protocol = req.body.protocol || req.headers["x-protocol"] || "lora";

    // Support raw GSM string in body text or JSON
    const payloadData = typeof req.body === "string" ? { rawGsmString: req.body } : req.body;

    const result = await sensorService.ingestGatewayPayload({
      gatewayId,
      protocol,
      ...payloadData,
    });

    res.status(200).json({
      success: true,
      message: "Gateway payload ingested successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSensors,
  getSensorById,
  getSensorSummary,
  getSensorAnomalies,
  createSensor,
  addSensorReading,
  getSensorReadings,
  ingestGateway,
};