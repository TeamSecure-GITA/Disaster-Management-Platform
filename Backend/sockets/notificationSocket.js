const { getIO } = require("./socket");

const emitNotification = (userId, notification) => {
  const io = getIO();

  io.to(`user_${userId}`).emit(
    "notification",
    notification
  );
};

const emitNotificationRead = (userId, notificationId) => {
  const io = getIO();

  io.to(`user_${userId}`).emit(
    "notificationRead",
    {
      notificationId,
    }
  );
};

module.exports = {
  emitNotification,
  emitNotificationRead,
};