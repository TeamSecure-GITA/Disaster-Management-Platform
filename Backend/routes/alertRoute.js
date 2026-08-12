const express = require("express");

const {
  createAlert,
  getAlerts,
  getAlert,
  deleteAlert,
} = require("../controllers/alertController");

const {
  createAlertValidator,
} = require("../validators/alertValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

const router = express.Router();

router.post(
  "/",
  createAlertValidator,
  validationMiddleware,
  createAlert
);

router.get("/", getAlerts);

router.get("/:id", getAlert);

router.delete("/:id", deleteAlert);

module.exports = router;