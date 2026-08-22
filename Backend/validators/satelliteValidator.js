const { body, param } = require("express-validator");

const dataTypes = [
  "imagery",
  "weather",
  "flood",
  "fire",
  "vegetation",
  "disaster",
  "other",
];

const processingStatuses = [
  "raw",
  "processing",
  "processed",
  "failed",
];

const createSatelliteValidator = [
  body("provider")
    .trim()
    .notEmpty()
    .withMessage("Satellite provider is required"),
  body("dataType")
    .isIn(dataTypes)
    .withMessage("Invalid satellite data type"),
  body("acquisitionTime")
    .isISO8601()
    .withMessage("Valid acquisition time is required"),
  body("location")
    .isObject()
    .withMessage("Location must be an object"),
  body("location.coordinates")
    .isArray({ min: 2, max: 2 })
    .withMessage("Location coordinates must contain longitude and latitude"),
  body("cloudCoverage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Cloud coverage must be between 0 and 100"),
];

const satelliteIdValidator = [
  param("id")
    .isMongoId()
    .withMessage("Valid satellite data ID is required"),
];

const processingStatusValidator = [
  body("processingStatus")
    .isIn(processingStatuses)
    .withMessage("Invalid processing status"),
];

module.exports = {
  createSatelliteValidator,
  satelliteIdValidator,
  processingStatusValidator,
};