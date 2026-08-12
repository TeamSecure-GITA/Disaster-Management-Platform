const express = require("express");

const {
  createDrone,
  createMission,
  getDrones,
  getMissions,
} = require("../controllers/droneController");

const router = express.Router();

router.post("/", createDrone);

router.get("/", getDrones);

router.post(
  "/missions",
  createMission
);

router.get(
  "/missions",
  getMissions
);

module.exports = router;