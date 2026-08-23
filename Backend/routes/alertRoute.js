const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { operationsOnly } = require("../middleware/adminMiddleware");

const {
  createAlert,
  getAlerts,
  getAlert,
  updateAlert,
  deleteAlert,
} = require("../controllers/alertController");

const {
  createAlertValidator,
} = require("../validators/alertValidator");

const {
  validate: validationMiddleware,
} = require("../middleware/validationMiddleware");

const router = express.Router();

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