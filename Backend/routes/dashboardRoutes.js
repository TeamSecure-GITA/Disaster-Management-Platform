const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const { getDashboardSummary } = require("../controllers/dashboardController");
const {
  createHazardReport,
  getMyHazardReports,
  requestCallback,
} = require("../controllers/dashboardFeatureController");
const { hazardReportValidator } = require("../validators/dashboardValidator");

const router = express.Router();

router.use(protect);
router.get("/summary", getDashboardSummary);
router.post("/hazard-reports", hazardReportValidator, validate, createHazardReport);
router.get("/hazard-reports/mine", getMyHazardReports);
router.post("/callbacks", requestCallback);

module.exports = router;
