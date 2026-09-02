const express = require("express");

const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateFcmToken,
  uploadAvatar,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const { imageUpload } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", protect, adminOnly, getUsers);
router.post("/fcm-token", protect, updateFcmToken);
router.patch("/fcm-token", protect, updateFcmToken);
// Avatar upload — multipart/form-data, field name: "avatar"
router.post("/upload-avatar", protect, imageUpload.single("avatar"), uploadAvatar);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

module.exports = router;