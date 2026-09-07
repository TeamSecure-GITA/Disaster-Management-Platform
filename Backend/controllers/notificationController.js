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

const Alert = require("../models/Alert");

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

    const userId = requestedUserId || req.user?._id || null;

    let notifications = await notificationService.getUserNotifications(userId);

    // If notifications collection is empty or fresh, populate from live active alerts
    if (!notifications || notifications.length === 0) {
      const activeAlerts = await Alert.find({ status: "active" })
        .sort({ createdAt: -1 })
        .limit(25)
        .lean();

      if (activeAlerts && activeAlerts.length > 0) {
        notifications = activeAlerts.map((a) => ({
          _id: a._id,
          title: a.title,
          message: a.message,
          type: "disaster_alert",
          priority: a.severity || "high",
          sourceAgency: a.sourceAgency || "Official Disaster Management Portal",
          sourceUrl: a.sourceUrl || "https://sachet.ndma.gov.in/",
          isBroadcast: true,
          isRead: false,
          createdAt: a.createdAt,
        }));
      }
    }

    res.status(200).json({
      success: true,
      data: notifications || [],
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