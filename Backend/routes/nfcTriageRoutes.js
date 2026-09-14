const express = require("express");
const router = express.Router();
const nfcTriageController = require("../controllers/nfcTriageController");

router.get("/patients", nfcTriageController.getTriagePatients);
router.post("/batch-sync", nfcTriageController.batchSyncTriageTags);

module.exports = router;
