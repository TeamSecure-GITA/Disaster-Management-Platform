const express = require("express");

const {
  getUsers,
  getUserById,
  updateFcmToken,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getUsers);
router.post("/fcm-token", protect, updateFcmToken);
router.patch("/fcm-token", protect, updateFcmToken);
router.get("/:id", getUserById);

module.exports = router;