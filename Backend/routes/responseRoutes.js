const express = require("express");
const router = express.Router();
const responseController = require("../controllers/responseController");

router.post("/orchestrate", responseController.orchestrateResponse);
router.post("/", responseController.orchestrateResponse);
router.get("/status", responseController.getSystemStatus);

module.exports = router;
