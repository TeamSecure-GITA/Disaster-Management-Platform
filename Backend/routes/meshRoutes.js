const express = require("express");

const {
  ingestMessage,
  registerBeacon,
  getBeacons,
  getBeaconById,
  updateBeacon,
  getBeaconHealth,
  getMeshMessages,
  getMeshTopology,
  acknowledgeSOS,
} = require("../controllers/meshController");

const {
  ingestMessageValidator,
  registerBeaconValidator,
  updateBeaconValidator,
  acknowledgeValidator,
  messageQueryValidator,
} = require("../validators/meshValidator");

const {
  validate: validationMiddleware,
} = require("../middleware/validationMiddleware");
const { protect } = require("../middleware/authMiddleware");
const { operationsOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// Gateway webhook — API-key auth (headless LoRa gateways can't do JWT)
// ─────────────────────────────────────────────────────────────────────────────

const meshApiKeyAuth = (req, res, next) => {
  const apiKey = req.headers["x-mesh-api-key"];
  const validKey = process.env.MESH_API_KEY;

  if (!validKey) {
    // If no MESH_API_KEY is configured, allow all ingest requests in dev mode
    if (process.env.NODE_ENV === "production") {
      return res.status(500).json({
        success: false,
        message: "Mesh API key not configured on server",
      });
    }
    return next();
  }

  if (!apiKey || apiKey !== validKey) {
    return res.status(401).json({
      success: false,
      message: "Invalid or missing mesh API key",
    });
  }

  next();
};

// ── Gateway ingest endpoint ────────────────────────────────────────────────
router.post(
  "/ingest",
  meshApiKeyAuth,
  ingestMessageValidator,
  validationMiddleware,
  ingestMessage
);

// ── Beacon management ──────────────────────────────────────────────────────
router.post(
  "/beacons",
  protect,
  operationsOnly,
  registerBeaconValidator,
  validationMiddleware,
  registerBeacon
);

router.get("/beacons", getBeacons);

router.get("/beacons/:id", getBeaconById);

router.put(
  "/beacons/:id",
  protect,
  operationsOnly,
  updateBeaconValidator,
  validationMiddleware,
  updateBeacon
);

// ── Network health & topology ──────────────────────────────────────────────
router.get("/health", getBeaconHealth);

router.get(
  "/messages",
  messageQueryValidator,
  validationMiddleware,
  getMeshMessages
);

router.get("/topology", getMeshTopology);

// ── SOS acknowledgement ────────────────────────────────────────────────────
router.put(
  "/messages/:id/acknowledge",
  protect,
  operationsOnly,
  acknowledgeValidator,
  validationMiddleware,
  acknowledgeSOS
);

module.exports = router;
