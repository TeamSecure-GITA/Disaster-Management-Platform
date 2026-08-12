const { body } = require("express-validator");

const createSOSValidator = [
  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Valid latitude is required"),

  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Valid longitude is required"),

  body("message")
    .optional()
    .trim(),

  body("emergencyType")
    .optional()
    .isIn([
      "medical",
      "fire",
      "trapped",
      "accident",
      "flood",
      "other",
    ])
    .withMessage("Invalid emergency type"),
];

module.exports = {
  createSOSValidator,
};