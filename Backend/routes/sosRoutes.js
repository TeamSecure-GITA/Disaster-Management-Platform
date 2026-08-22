const express = require("express");

const {
  createSOS,
  getSOSRequests,
  getSOSById,
} = require("../controllers/sosController");

const {
  createSOSValidator,
} = require("../validators/sosValidator");

const {
  validate: validationMiddleware,
} = require("../middleware/validationMiddleware");
const { sosLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.post(
  "/",
  sosLimiter,
  createSOSValidator,
  validationMiddleware,
  createSOS
);

router.get("/", getSOSRequests);

router.get("/:id", getSOSById);

module.exports = router;