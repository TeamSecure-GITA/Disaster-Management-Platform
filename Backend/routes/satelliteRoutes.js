const express = require("express");

const {
  saveSatelliteData,
  getSatelliteData,
} = require("../controllers/satelliteController");

const router = express.Router();

router.post(
  "/",
  saveSatelliteData
);

router.get(
  "/",
  getSatelliteData
);

module.exports = router;