const { body } = require("express-validator");

const createNotificationValidator = [
  body("recipient")
    .isMongoId()
    .withMessage("Valid recipient is required"),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Notification title is required")
    .isLength({ max: 200 })
    .withMessage("Notification title is too long"),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Notification message is required")
    .isLength({ max: 5000 })
    .withMessage("Notification message is too long"),
  body("type")
    .optional()
    .isIn(["alert", "sos", "task", "volunteer", "weather", "system", "general"])
    .withMessage("Invalid notification type"),
  body("priority")
    .optional()
    .isIn(["low", "normal", "high", "critical"])
    .withMessage("Invalid notification priority"),
  body("channels")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Channels must be a non-empty array"),
  body("channels.*")
    .optional()
    .isIn(["in-app", "email", "sms", "push"])
    .withMessage("Invalid notification channel"),
];

module.exports = {
  createNotificationValidator,
};
