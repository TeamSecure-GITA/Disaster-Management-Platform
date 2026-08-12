const express = require("express");

const {
  createSOS,
  getSOSRequests,
  getSOSById,
} = require("../controllers/sosController");

const {
  createSOSValidator,
} = require("../validators/sosValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

const router = express.Router();

router.post(
  "/",
  createSOSValidator,
  validationMiddleware,
  createSOS
);

router.get("/", getSOSRequests);

router.get("/:id", getSOSById);

module.exports = router;