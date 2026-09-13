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
  getAmcContracts,
  seedMesh,
  simulatePacket,
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

// Seamless dev auth fallback so dashboard actions work during demos/evaluation
const devOrOperations = (req, res, next) => {
  if (process.env.NODE_ENV !== "production" && !req.headers.authorization) {
    req.user = { _id: "000000000000000000000000", role: "admin" };
    return next();
  }
  protect(req, res, (err) => {
    if (err) return next(err);
    operationsOnly(req, res, next);
  });
};

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

// ── Demo seed & live simulation ────────────────────────────────────────────
router.post("/seed", seedMesh);
router.post("/simulate", simulatePacket);

// ── AMC Revenue & Contracts ────────────────────────────────────────────────
router.get("/amc", getAmcContracts);

// ── Beacon management ──────────────────────────────────────────────────────
router.post(
  "/beacons",
  devOrOperations,
  registerBeaconValidator,
  validationMiddleware,
  registerBeacon
);

router.get("/beacons", getBeacons);

router.get("/beacons/:id", getBeaconById);

router.put(
  "/beacons/:id",
  devOrOperations,
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
  devOrOperations,
  acknowledgeValidator,
  validationMiddleware,
  acknowledgeSOS
);

module.exports = router;
