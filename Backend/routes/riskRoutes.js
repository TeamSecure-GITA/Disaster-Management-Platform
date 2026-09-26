const express = require("express");
const router = express.Router();
const riskController = require("../controllers/riskController");

router.get("/zones", riskController.getRiskZones);
router.post("/assess", riskController.assessRisk);
router.get("/summary", riskController.getRiskSummary);

module.exports = router;
