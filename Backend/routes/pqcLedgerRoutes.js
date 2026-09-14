const express = require("express");
const router = express.Router();
const pqcLedgerController = require("../controllers/pqcLedgerController");

router.get("/chain", pqcLedgerController.getLedgerChain);
router.post("/verify", pqcLedgerController.verifyPqcSignature);
router.post("/sync", pqcLedgerController.syncOfflineBatch);

module.exports = router;
