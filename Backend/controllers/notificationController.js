const notificationService = require("../services/notificationService");

const createNotification = async (req, res, next) => {
  try {
    const notification =
      await notificationService.createNotification(req.body);

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const requestedUserId = req.params.userId;
    const isAdmin = ["admin", "operator"].includes(req.user?.role);

    if (requestedUserId && !isAdmin && requestedUserId !== req.user?._id?.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view these notifications",
      });
    }

    const userId = requestedUserId || req.user?._id;

    const notifications =
      await notificationService.getUserNotifications(userId);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

const markNotificationAsRead = async (req, res, next) => {
  try {
    const notification =
      await notificationService.markAsRead(
        req.params.id,
        req.user?._id,
        ["admin", "operator"].includes(req.user?.role)
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markNotificationAsRead,
};