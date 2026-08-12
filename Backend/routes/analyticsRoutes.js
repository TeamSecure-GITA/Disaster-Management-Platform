const express = require("express");

const {
  createAnalytics,
  getAnalytics,
} = require("../controllers/analyticsController");

const router = express.Router();

router.post(
  "/",
  createAnalytics
);

router.get(
  "/",
  getAnalytics
);

module.exports = router;