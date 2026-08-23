const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { operationsOnly } = require("../middleware/adminMiddleware");

const {
  createAnalytics,
  getAnalytics,
} = require("../controllers/analyticsController");

const router = express.Router();

router.post(
  "/",
  protect,
  operationsOnly,
  createAnalytics
);

router.get(
  "/",
  getAnalytics
);

module.exports = router;