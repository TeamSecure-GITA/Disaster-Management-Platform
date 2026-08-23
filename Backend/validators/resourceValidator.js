const { body } = require("express-validator");

const createResourceValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Resource name is required"),

  body("type")
    .trim()
    .notEmpty()
    .withMessage("Resource type is required"),

  body("quantity")
    .isFloat({ min: 0 })
    .withMessage("Quantity must be zero or greater"),

  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Valid latitude is required"),

  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Valid longitude is required"),
];

module.exports = {
  createResourceValidator,
};