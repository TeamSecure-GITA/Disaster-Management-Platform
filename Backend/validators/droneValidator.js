const { body, param } = require("express-validator");

const droneStatuses = [
  "available",
  "in_mission",
  "charging",
  "maintenance",
  "offline",
];

const missionStatuses = [
  "planned",
  "approved",
  "in_progress",
  "completed",
  "aborted",
];

const missionTypes = [
  "surveillance",
  "search_rescue",
  "mapping",
  "fire_monitoring",
  "flood_monitoring",
  "delivery",
  "other",
];

const createDroneValidator = [
  body("droneId")
    .trim()
    .notEmpty()
    .withMessage("Drone ID is required"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Drone name is required"),
  body("status")
    .optional()
    .isIn(droneStatuses)
    .withMessage("Invalid drone status"),
  body("batteryLevel")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Battery level must be between 0 and 100"),
];

const missionValidator = [
  body("drone")
    .isMongoId()
    .withMessage("Valid drone ID is required"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Mission name is required"),
  body("type")
    .isIn(missionTypes)
    .withMessage("Invalid mission type"),
  body("status")
    .optional()
    .isIn(missionStatuses)
    .withMessage("Invalid mission status"),
  body("waypoints")
    .optional()
    .isArray()
    .withMessage("Waypoints must be an array"),
];

const droneIdValidator = [
  param("id")
    .isMongoId()
    .withMessage("Valid drone ID is required"),
];

const missionIdValidator = [
  param("id")
    .isMongoId()
    .withMessage("Valid mission ID is required"),
];

const statusValidator = [
  body("status")
    .isIn([...droneStatuses, ...missionStatuses])
    .withMessage("Invalid status"),
];

const telemetryValidator = [
  body("batteryLevel")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Battery level must be between 0 and 100"),
  body("altitude")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Altitude must be zero or greater"),
  body("location")
    .optional()
    .isObject()
    .withMessage("Location must be an object"),
  body("status")
    .optional()
    .isIn(droneStatuses)
    .withMessage("Invalid drone status"),
];

module.exports = {
  createDroneValidator,
  missionValidator,
  droneIdValidator,
  missionIdValidator,
  statusValidator,
  telemetryValidator,
};