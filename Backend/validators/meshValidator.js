const { body, param, query } = require("express-validator");

const ingestMessageValidator = [
  body("messageId")
    .notEmpty()
    .withMessage("messageId is required")
    .isString()
    .trim(),

  body("type")
    .notEmpty()
    .withMessage("type is required")
    .isIn(["sos", "soil_tilt", "heartbeat", "alert", "data"])
    .withMessage("Invalid message type"),

  body("originEui")
    .notEmpty()
    .withMessage("originEui is required")
    .isString()
    .trim(),

  body("gatewayEui").optional().isString().trim(),

  body("relayPath").optional().isArray(),

  body("latitude")
    .optional({ values: "falsy" })
    .isFloat({ min: -90, max: 90 })
    .withMessage("latitude must be between -90 and 90"),

  body("longitude")
    .optional({ values: "falsy" })
    .isFloat({ min: -180, max: 180 })
    .withMessage("longitude must be between -180 and 180"),

  body("rssi").optional().isFloat(),

  body("snr").optional().isFloat(),

  body("hopCount").optional().isInt({ min: 0 }),

  body("originatedAt").optional().isISO8601(),

  body("payload").optional().isObject(),
];

const registerBeaconValidator = [
  body("deviceEui")
    .notEmpty()
    .withMessage("deviceEui is required")
    .isString()
    .trim(),

  body("name")
    .notEmpty()
    .withMessage("name is required")
    .isString()
    .trim(),

  body("type")
    .optional()
    .isIn(["beacon", "gateway", "relay"])
    .withMessage("Invalid beacon type"),

  body("powerSource")
    .optional()
    .isIn(["solar", "battery", "hybrid"])
    .withMessage("Invalid power source"),

  body("latitude")
    .optional({ values: "falsy" })
    .isFloat({ min: -90, max: 90 }),

  body("longitude")
    .optional({ values: "falsy" })
    .isFloat({ min: -180, max: 180 }),

  body("villageName").optional().isString().trim(),
  body("district").optional().isString().trim(),
  body("state").optional().isString().trim(),

  body("tiltThreshold")
    .optional()
    .isFloat({ min: 1, max: 90 })
    .withMessage("tiltThreshold must be between 1 and 90 degrees"),
];

const updateBeaconValidator = [
  param("id").isMongoId().withMessage("Invalid beacon ID"),

  body("name").optional().isString().trim(),
  body("villageName").optional().isString().trim(),
  body("district").optional().isString().trim(),
  body("state").optional().isString().trim(),
  body("type")
    .optional()
    .isIn(["beacon", "gateway", "relay"]),
  body("powerSource")
    .optional()
    .isIn(["solar", "battery", "hybrid"]),
  body("status")
    .optional()
    .isIn(["online", "offline", "low_battery", "maintenance", "pending"]),
  body("tiltThreshold")
    .optional()
    .isFloat({ min: 1, max: 90 }),
];

const acknowledgeValidator = [
  param("id").isMongoId().withMessage("Invalid message ID"),
  body("status")
    .optional()
    .isIn(["acknowledged", "dispatched", "resolved"])
    .withMessage("Invalid status"),
];

const messageQueryValidator = [
  query("type")
    .optional()
    .isIn(["sos", "soil_tilt", "heartbeat", "alert", "data"]),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 200 }),
];

module.exports = {
  ingestMessageValidator,
  registerBeaconValidator,
  updateBeaconValidator,
  acknowledgeValidator,
  messageQueryValidator,
};
