const { body } = require("express-validator");

const createShelterValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Shelter name is required"),

  body("address")
    .trim()
    .notEmpty()
    .withMessage("Shelter address is required"),

  body("capacity")
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive number"),

  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Valid latitude is required"),

  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Valid longitude is required"),
];

module.exports = {
  createShelterValidator,
};