const express = require("express");
const router = express.Router();
const riskController = require("../controllers/riskController");

router.get("/zones", riskController.getRiskZones);
router.post("/assess", riskController.assessRisk);
router.get("/summary", riskController.getRiskSummary);
router.get("/assessments/:zoneId", riskController.getZoneAssessment);

module.exports = router;
