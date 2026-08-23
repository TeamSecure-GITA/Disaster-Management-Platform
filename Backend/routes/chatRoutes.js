const express = require("express");

const {
  sendMessage,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");
const { chatLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.post("/", protect, chatLimiter, sendMessage);

module.exports = router;