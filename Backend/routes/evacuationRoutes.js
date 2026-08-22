const express = require("express");

const {
    generateEvacuationPlan,
} = require("../controllers/evacuationController");

const router = express.Router();

router.post(
    "/plan",
    generateEvacuationPlan
);

module.exports = router;