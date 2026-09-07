const express = require("express");
const {
  createNotification,
  getNotifications,
  markNotificationAsRead,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");
const { operationsOnly } = require("../middleware/adminMiddleware");
const {
  createNotificationValidator,
} = require("../validators/notificationValidator");
const { validate } = require("../middleware/validationMiddleware");
const { verifyToken } = require("../utils/generateToken");
const User = require("../models/User");

const router = express.Router();

/**
 * Optional auth: populates req.user if a valid Bearer token is passed,
 * but does not reject unauthenticated/guest users so live alerts & broadcast
 * notifications can be fetched by anyone without 401 error.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token && token !== "guest" && token !== "null" && token !== "undefined") {
        const decoded = verifyToken(token);
        if (decoded && (decoded.id || decoded._id)) {
          const userId = decoded.id || decoded._id;
          req.user = await User.findById(userId).select("-password");
        }
      }
    }
  } catch (_) {
    // Ignore invalid token and continue as guest
  }
  next();
};

// ── Public / Broadcast & User Notifications ──────────────────────
router.get("/", optionalAuth, getNotifications);
router.get("/mine", optionalAuth, getNotifications);
router.get("/user/:userId", optionalAuth, getNotifications);

// ── Protected Actions ────────────────────────────────────────────
router.post(
  "/",
  protect,
  operationsOnly,
  createNotificationValidator,
  validate,
  createNotification
);

router.patch("/:id/read", protect, markNotificationAsRead);

module.exports = router;