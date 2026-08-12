const { body } = require("express-validator");

const createAlertValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Alert title is required"),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("Alert message is required"),

  body("severity")
    .optional()
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Invalid alert severity"),

  body("disasterType")
    .optional()
    .isIn([
      "flood",
      "fire",
      "cyclone",
      "earthquake",
      "landslide",
      "tsunami",
      "other",
    ])
    .withMessage("Invalid disaster type"),
];

module.exports = {
  createAlertValidator,
};