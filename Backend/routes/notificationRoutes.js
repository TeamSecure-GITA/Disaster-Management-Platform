const express = require("express");

const {
  createNotification,
  getNotifications,
  markNotificationAsRead,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", createNotification);

router.get(
  "/user/:userId",
  getNotifications
);

router.get("/mine", getNotifications);

router.patch(
  "/:id/read",
  markNotificationAsRead
);

module.exports = router;