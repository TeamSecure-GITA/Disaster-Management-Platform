const { body } = require("express-validator");

const createVolunteerValidator = [
  body("skills")
    .isArray({ min: 1 })
    .withMessage("At least one skill is required"),

  body("availability")
    .optional()
    .isIn(["available", "unavailable", "busy"])
    .withMessage("Invalid availability status"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required"),
];

module.exports = {
  createVolunteerValidator,
};