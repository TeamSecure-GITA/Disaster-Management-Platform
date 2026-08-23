const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { operationsOnly } = require("../middleware/adminMiddleware");

const {
    generateEvacuationPlan,
} = require("../controllers/evacuationController");

const router = express.Router();

router.post(
    "/plan",
    protect,
    operationsOnly,
    generateEvacuationPlan
);

module.exports = router;