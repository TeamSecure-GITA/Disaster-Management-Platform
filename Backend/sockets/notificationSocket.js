const { getIO } = require("./socket");

const emitNotification = (userId, notification) => {
  let io;
  try {
    io = getIO();
  } catch (error) {
    return false;
  }

  io.to(`user:${userId}`).emit(
    "notification",
    notification
  );
};

const emitNotificationRead = (userId, notificationId) => {
  let io;
  try {
    io = getIO();
  } catch (error) {
    return false;
  }

  io.to(`user:${userId}`).emit(
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