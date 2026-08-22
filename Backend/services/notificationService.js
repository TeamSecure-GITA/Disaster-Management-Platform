const Notification = require("../models/Notification");
const pushNotificationService = require("./pushNotificationService");
const { sendEmail } = require("./emailService");
const { sendSMS } = require("./smsService");
const { emitNotification, emitNotificationRead } = require("../sockets/notificationSocket");

const dispatchNotification = async (notification) => {
  const delivery = {
    inApp: false,
    push: false,
    email: false,
    sms: false,
  };

  const channels = Array.isArray(notification.channels) && notification.channels.length
    ? notification.channels
    : ["in-app"];

  if (channels.includes("in-app")) {
    emitNotification(String(notification.recipient), {
      _id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      createdAt: notification.createdAt,
    });
    delivery.inApp = true;
  }

  if (channels.includes("push")) {
    const pushResult = await pushNotificationService.sendToUser(
      notification.recipient,
      notification.title,
      notification.message,
      {
        notificationId: String(notification._id),
        type: notification.type,
      }
    );
    delivery.push = pushResult.success;
  }

  if (channels.includes("email")) {
    const user = await notification.populate("recipient");
    const emailResult = await sendEmail({
      to: user.recipient?.email,
      subject: notification.title,
      text: notification.message,
      html: `<p>${notification.message}</p>`,
    });
    delivery.email = Boolean(emailResult && emailResult.messageId);
  }

  if (channels.includes("sms")) {
    const user = await notification.populate("recipient");
    const smsResult = await sendSMS(user.recipient?.phone, notification.message);
    delivery.sms = smsResult.success;
  }

  const finalStatus = Object.values(delivery).some(Boolean) ? "sent" : "failed";

  await Notification.findByIdAndUpdate(notification._id, {
    status: finalStatus,
    sentAt: finalStatus === "sent" ? new Date() : null,
  });

  return {
    ...notification.toObject(),
    delivery,
    status: finalStatus,
  };
};

const createNotification = async (notificationData) => {
  const notification = await Notification.create(notificationData);
  return dispatchNotification(notification);
};

const getUserNotifications = async (userId) => {
  return await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 });
};

const markAsRead = async (notificationId) => {
  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (notification) {
    emitNotificationRead(String(notification.recipient), String(notification._id));
  }

  return notification;
};

const processPendingNotifications = async () => {
  const pendingNotifications = await Notification.find({
    status: "pending",
  }).limit(100).populate("recipient");

  const results = [];

  for (const notification of pendingNotifications) {
    results.push(await dispatchNotification(notification));
  }

  return results;
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  processPendingNotifications,
  dispatchNotification,
};