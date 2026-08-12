const express = require("express");

const {
  createNotification,
  getNotifications,
  markNotificationAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.post("/", createNotification);

router.get(
  "/user/:userId",
  getNotifications
);

router.patch(
  "/:id/read",
  markNotificationAsRead
);

module.exports = router;