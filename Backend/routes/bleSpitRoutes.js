const express = require("express");
const router = express.Router();
const bleSpitController = require("../controllers/bleSpitController");

router.get("/signals", bleSpitController.getCapturedSignals);
router.post("/burst", bleSpitController.recordMicroBurst);

module.exports = router;
