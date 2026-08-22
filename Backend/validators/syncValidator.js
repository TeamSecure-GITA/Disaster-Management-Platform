const { body } = require("express-validator");

const syncValidator = [
  body("deviceId")
    .isString()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("Device ID is required and must be 120 characters or fewer"),
  body("operations")
    .isArray({ min: 1, max: 50 })
    .withMessage("Operations must contain between 1 and 50 items"),
  body("operations.*.operationId")
    .isString()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("Each operation requires an operation ID"),
  body("operations.*.resource")
    .equals("family")
    .withMessage("Only family synchronization is supported"),
  body("operations.*.action")
    .isIn(["upsert", "add_member", "update_member", "delete_member", "update_safety"])
    .withMessage("Unsupported synchronization action"),
  body("operations.*.payload")
    .optional()
    .isObject()
    .withMessage("Operation payload must be an object"),
  body("operations.*.clientCreatedAt")
    .optional()
    .isISO8601()
    .withMessage("clientCreatedAt must be a valid ISO date"),
];

module.exports = { syncValidator };