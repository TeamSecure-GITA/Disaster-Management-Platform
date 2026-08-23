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

const router = express.Router();

router.use(protect);

router.post("/", operationsOnly, createNotificationValidator, validate, createNotification);

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