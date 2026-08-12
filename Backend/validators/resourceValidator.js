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

  body("location")
    .trim()
    .notEmpty()
    .withMessage("Resource location is required"),
];

module.exports = {
  createResourceValidator,
};