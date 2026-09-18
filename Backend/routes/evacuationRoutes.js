const express = require("express");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { operationsOnly } = require("../middleware/adminMiddleware");

const {
    generateEvacuationPlan,
    triggerCitizenUnsafeAlert,
    broadcastToUnsafeCitizens,
} = require("../controllers/evacuationController");

const router = express.Router();

router.post(
    "/plan",
    optionalAuth,
    generateEvacuationPlan
);

// Citizen Unsafe Emergency Notification, Phone Siren & Nearest Safe Place Route
router.post(
    "/citizen-unsafe-alert",
    optionalAuth,
    triggerCitizenUnsafeAlert
);

// Operator Broadcast to all citizens in danger zone
router.post(
    "/broadcast-unsafe-citizens",
    protect,
    operationsOnly,
    broadcastToUnsafeCitizens
);

module.exports = router;