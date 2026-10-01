const express = require("express");
const { syncBatch, getChanges } = require("../controllers/syncController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const { syncValidator } = require("../validators/syncValidator");

const router = express.Router();

router.post("/batch", protect, syncValidator, validate, syncBatch);
router.get("/changes", protect, getChanges);

module.exports = router;