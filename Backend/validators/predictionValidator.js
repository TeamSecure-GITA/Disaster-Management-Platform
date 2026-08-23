const { body, query } = require("express-validator");

const predictionValidator = [
  body("disasterType")
    .optional()
    .isIn(["flood", "fire", "cyclone", "landslide", "earthquake", "heatwave", "other"])
    .withMessage("Invalid disaster type"),
  body("latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Valid latitude is required"),
  body("longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Valid longitude is required"),
  body("location.coordinates")
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage("Location coordinates must contain longitude and latitude"),
];

const predictionQueryValidator = [
  query("disasterType")
    .optional()
    .isIn(["flood", "fire", "cyclone", "landslide", "earthquake", "heatwave", "other"])
    .withMessage("Invalid disaster type"),
  query("riskLevel")
    .optional()
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Invalid risk level"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

module.exports = {
  predictionValidator,
  predictionQueryValidator,
};
