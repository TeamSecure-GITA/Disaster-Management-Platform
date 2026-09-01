const { body } = require("express-validator");

const createSOSValidator = [
  // latitude / longitude are optional — a valid GPS fix provides them;
  // when GPS is unavailable the frontend omits them and the controller
  // defaults to [0, 0] coordinates with hasLocation=false.
  body("latitude")
    .optional({ values: "falsy" })  // skipped when undefined / null / ""
    .isFloat({ min: -90, max: 90 })
    .withMessage("latitude must be between -90 and 90"),

  body("longitude")
    .optional({ values: "falsy" })
    .isFloat({ min: -180, max: 180 })
    .withMessage("longitude must be between -180 and 180"),

  body("message")
    .optional()
    .trim(),

  // Keep in sync with the SOS model enum (includes missing_person)
  body("emergencyType")
    .optional()
    .isIn([
      "medical",
      "fire",
      "trapped",
      "accident",
      "flood",
      "missing_person",
      "other",
    ])
    .withMessage("Invalid emergency type"),
];

module.exports = {
  createSOSValidator,
};