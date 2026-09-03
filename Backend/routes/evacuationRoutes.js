const express = require("express");
const { optionalAuth } = require("../middleware/authMiddleware");

const {
    generateEvacuationPlan,
} = require("../controllers/evacuationController");

const router = express.Router();

router.post(
    "/plan",
    optionalAuth,
    generateEvacuationPlan
);

module.exports = router;