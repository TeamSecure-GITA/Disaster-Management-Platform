const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { operationsOnly } = require("../middleware/adminMiddleware");

const {
  createAlert,
  getAlerts,
  getAlert,
  updateAlert,
  deleteAlert,
  getLiveGovtAlerts,
  syncGovtAlerts,
  getGovtPortals,
  getFeedHealth,
  getCrowdSignals,
  verifyCrowdSignalAction,
} = require("../controllers/alertController");

const {
  createAlertValidator,
} = require("../validators/alertValidator");

const {
  validate: validationMiddleware,
} = require("../middleware/validationMiddleware");

const router = express.Router();

// Live official programmatic disaster feeds & early warning health (publicly accessible)
router.get("/live-govt", getLiveGovtAlerts);
router.get("/portals", getGovtPortals);
router.get("/feed-health", getFeedHealth);
router.post("/sync-govt", syncGovtAlerts);

// Live crowd-sourced social media signals & volume anomalies
router.get("/crowd-signals", getCrowdSignals);
router.post("/crowd-signals/:id/verify", protect, operationsOnly, verifyCrowdSignalAction);

router.post(
  "/",
  createAlertValidator,
  validationMiddleware,
  protect,
  operationsOnly,
  createAlert
);

router.get("/", getAlerts);

router.get("/:id", getAlert);

router.put("/:id", protect, operationsOnly, updateAlert);

router.delete("/:id", protect, operationsOnly, deleteAlert);

module.exports = router;