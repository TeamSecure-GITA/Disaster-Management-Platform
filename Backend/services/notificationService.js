const Notification = require("../models/Notification");

const createNotification = async (notificationData) => {
  return await Notification.create(notificationData);
};

const getUserNotifications = async (userId) => {
  return await Notification.find({ user: userId })
    .sort({ createdAt: -1 });
};

const markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { read: true },
    { new: true }
  );
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
};