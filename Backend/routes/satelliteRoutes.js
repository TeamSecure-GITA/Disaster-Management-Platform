const express = require("express");

const {
  saveSatelliteData,
  getSatelliteData,
  getSatelliteDataById,
  updateProcessingStatus,
} = require("../controllers/satelliteController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/adminMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const {
  createSatelliteValidator,
  satelliteIdValidator,
  processingStatusValidator,
} = require("../validators/satelliteValidator");

const router = express.Router();

router.use(protect);
const operationsOnly = allowRoles("admin", "operator");

router.post("/", operationsOnly, createSatelliteValidator, validate, saveSatelliteData);

router.get(
  "/",
  getSatelliteData
);

router.get("/:id", satelliteIdValidator, validate, getSatelliteDataById);
router.patch("/:id/status", operationsOnly, processingStatusValidator, validate, updateProcessingStatus);

module.exports = router;