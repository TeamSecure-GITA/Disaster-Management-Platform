const Notification = require("../models/Notification");
const pushNotificationService = require("./pushNotificationService");
const { sendEmail } = require("./emailService");
const { sendSMS } = require("./smsService");
const { emitNotification, emitNotificationRead } = require("../sockets/notificationSocket");

const dispatchNotification = async (notification) => {
  const recipientId = notification.recipient?._id || notification.recipient;
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
    delivery.inApp = emitNotification(String(recipientId), {
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
      recipientId,
      notification.title,
      notification.message,
      {
        notificationId: String(notification._id),
        type: notification.type,
      }
    );
    delivery.push = Boolean(pushResult?.success);
  }

  if (channels.includes("email") || channels.includes("sms")) {
    if (!notification.populated("recipient") && notification.recipient) {
      await notification.populate("recipient");
    }
  }

  if (channels.includes("email")) {
    const emailResult = await sendEmail({
      to: notification.recipient?.email,
      subject: notification.title,
      text: notification.message,
      html: `<p>${notification.message}</p>`,
    });
    delivery.email = Boolean(emailResult?.messageId);
  }

  if (channels.includes("sms")) {
    const smsResult = await sendSMS(notification.recipient?.phone, notification.message);
    delivery.sms = Boolean(smsResult?.success && !smsResult?.simulated);
  }

  const requestedDeliveries = channels.map((channel) => channel === "in-app" ? "inApp" : channel);
  const successfulDeliveries = requestedDeliveries.filter((channel) => delivery[channel]).length;
  const finalStatus = successfulDeliveries === requestedDeliveries.length
    ? "sent"
    : successfulDeliveries > 0
      ? "partial"
      : "failed";

  await Notification.findByIdAndUpdate(notification._id, {
    status: finalStatus,
    sentAt: successfulDeliveries > 0 ? new Date() : null,
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

const markAsRead = async (notificationId, userId, isAdmin = false) => {
  const filter = isAdmin
    ? { _id: notificationId }
    : { _id: notificationId, recipient: userId };
  const notification = await Notification.findOneAndUpdate(
    filter,
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