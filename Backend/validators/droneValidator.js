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
  body("waypoints").optional().custom((waypoints) => {
    const valid = waypoints.every((waypoint) =>
      Number.isFinite(Number(waypoint.latitude)) &&
      Number(waypoint.latitude) >= -90 && Number(waypoint.latitude) <= 90 &&
      Number.isFinite(Number(waypoint.longitude)) &&
      Number(waypoint.longitude) >= -180 && Number(waypoint.longitude) <= 180
    );
    if (!valid) throw new Error("Waypoints must contain valid latitude and longitude");
    return true;
  }),
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

const droneStatusValidator = [
  body("status")
    .isIn(droneStatuses)
    .withMessage("Invalid drone status"),
];

const missionStatusValidator = [
  body("status")
    .isIn(missionStatuses)
    .withMessage("Invalid mission status"),
];

const telemetryValidator = [
  body().custom((value) => {
    if (!value || !["batteryLevel", "altitude", "location", "status"].some((field) => value[field] !== undefined)) {
      throw new Error("At least one telemetry field is required");
    }
    return true;
  }),
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
  body("location.coordinates").optional().custom((coordinates) => {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      throw new Error("Location coordinates must contain longitude and latitude");
    }
    const [longitude, latitude] = coordinates.map(Number);
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180 ||
        !Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      throw new Error("Location coordinates are invalid");
    }
    return true;
  }),
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
  droneStatusValidator,
  missionStatusValidator,
  telemetryValidator,
};