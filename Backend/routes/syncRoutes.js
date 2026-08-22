const express = require("express");
const { syncBatch } = require("../controllers/syncController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const { syncValidator } = require("../validators/syncValidator");

const router = express.Router();

router.post("/batch", protect, syncValidator, validate, syncBatch);

module.exports = router;