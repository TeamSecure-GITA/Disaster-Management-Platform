const User = require("../models/User");
const { uploadFile } = require("../services/fileStorageService");

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const isOwnProfile = req.user?._id?.toString() === req.params.id;
    const isAdmin = ["admin", "super_admin"].includes(req.user?.role);

    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this profile",
      });
    }

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const isOwnProfile = req.user?._id?.toString() === req.params.id;
    const isAdmin = ["admin", "super_admin"].includes(req.user?.role);

    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this profile",
      });
    }

    const allowedFields = ["name", "phone", "profileImage", "address", "city", "state", "country", "preferredLanguage"];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([field]) => allowedFields.includes(field))
    );

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, message: "User updated successfully", data: user });
  } catch (error) { next(error); }
};

const deleteUser = async (req, res, next) => {
  try {
    const isOwnProfile = req.user?._id?.toString() === req.params.id;
    const isAdmin = ["admin", "super_admin"].includes(req.user?.role);

    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this profile",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(204).send();
  } catch (error) { next(error); }
};

const updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: "FCM token is required",
      });
    }

    const userId = req.user?._id || req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { fcmToken },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "FCM token updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users/upload-avatar
 * Uploads an avatar image to Cloudinary and saves the URL on the User document.
 * Requires multipart/form-data with field name "avatar".
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided. Use field name 'avatar'.",
      });
    }

    const result = await uploadFile(req.file, {
      folder: "disaster-management/avatars",
    });

    // Persist URL on the authenticated user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: result.url },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: { url: result.url, user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateFcmToken,
  uploadAvatar,
};