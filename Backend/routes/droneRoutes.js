const express = require("express");

const {
  createDrone,
  createMission,
  getDrones,
  getMissions,
  getDroneById,
  updateDrone,
  updateDroneStatus,
  updateDroneTelemetry,
  deleteDrone,
  getMissionById,
  updateMissionStatus,
} = require("../controllers/droneController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/adminMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const {
  createDroneValidator,
  missionValidator,
  droneIdValidator,
  missionIdValidator,
  statusValidator,
  telemetryValidator,
} = require("../validators/droneValidator");

const router = express.Router();

router.use(protect);
const operationsOnly = allowRoles("admin", "operator");

router.post("/", operationsOnly, createDroneValidator, validate, createDrone);

router.get("/", getDrones);

router.post(
  "/missions",
  operationsOnly,
  missionValidator,
  validate,
  createMission
);

router.get(
  "/missions",
  getMissions
);

router.get("/:id", droneIdValidator, validate, getDroneById);
router.patch("/:id", operationsOnly, droneIdValidator, validate, updateDrone);
router.patch("/:id/status", operationsOnly, droneIdValidator, statusValidator, validate, updateDroneStatus);
router.patch("/:id/telemetry", operationsOnly, telemetryValidator, validate, updateDroneTelemetry);
router.delete("/:id", operationsOnly, droneIdValidator, validate, deleteDrone);
router.get("/missions/:id", missionIdValidator, validate, getMissionById);
router.patch("/missions/:id/status", operationsOnly, missionIdValidator, statusValidator, validate, updateMissionStatus);

module.exports = router;