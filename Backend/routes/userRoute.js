const express = require("express");

const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateFcmToken,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", protect, adminOnly, getUsers);
router.post("/fcm-token", protect, updateFcmToken);
router.patch("/fcm-token", protect, updateFcmToken);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

module.exports = router;