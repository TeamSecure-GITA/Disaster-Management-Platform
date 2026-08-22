const express = require("express");

const {
  getUsers,
  getUserById,
  updateFcmToken,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", protect, adminOnly, getUsers);
router.post("/fcm-token", protect, updateFcmToken);
router.patch("/fcm-token", protect, updateFcmToken);
router.get("/:id", protect, getUserById);

module.exports = router;