const express = require("express");

const {
  createSOS,
  getSOSRequests,
  getSOSById,
  updateSOS,
  deleteSOS,
} = require("../controllers/sosController");

const {
  createSOSValidator,
} = require("../validators/sosValidator");

const {
  validate: validationMiddleware,
} = require("../middleware/validationMiddleware");
const { sosLimiter, threatBlockLimiter } = require("../middleware/rateLimitMiddleware");
const { protect } = require("../middleware/authMiddleware");
const { operationsOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.post(
  "/",
  threatBlockLimiter,   // 403 + blocked:true for burst abuse → frontend redirects to CERT-In
  sosLimiter,           // 429 for standard rate excess
  createSOSValidator,
  validationMiddleware,
  protect,
  createSOS
);

router.get("/", getSOSRequests);

router.get("/:id", getSOSById);

router.put("/:id", protect, operationsOnly, updateSOS);

router.delete("/:id", protect, operationsOnly, deleteSOS);

module.exports = router;