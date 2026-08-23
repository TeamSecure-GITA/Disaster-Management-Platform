const { body } = require("express-validator");

const hazardReportValidator = [
  body("description")
    .isString()
    .trim()
    .isLength({ min: 3, max: 2000 })
    .withMessage("Description must be between 3 and 2000 characters"),
  body("location")
    .optional()
    .isObject()
    .withMessage("Location must be an object"),
  body("location.latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("location.longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
];

module.exports = { hazardReportValidator };
