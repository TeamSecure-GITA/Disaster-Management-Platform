const express = require("express");

const {
  createDisaster,
  getDisasters,
  getDisasterById,
} = require("../controllers/disasterController");

const router = express.Router();

router.post("/", createDisaster);

router.get("/", getDisasters);

router.get("/:id", getDisasterById);

module.exports = router;