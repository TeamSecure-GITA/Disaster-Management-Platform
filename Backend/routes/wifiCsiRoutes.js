const express = require("express");
const router = express.Router();
const wifiCsiController = require("../controllers/wifiCsiController");

// Public & localized disaster node endpoints
router.get("/sites", wifiCsiController.getDisasterSites);
router.get("/blueprint/:siteId", wifiCsiController.getSiteBlueprint);
router.post("/analyze", wifiCsiController.analyzeCsiData);
router.get("/stream", wifiCsiController.getLiveCsiStream);

module.exports = router;
