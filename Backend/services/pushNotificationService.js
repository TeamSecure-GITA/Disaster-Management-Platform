const sendPushNotification = async (userId, title, message) => {
  console.log("Push notification:", {
    userId,
    title,
    message,
  });

  return {
    success: true,
    message: "Push notification service placeholder executed",
  };
};

module.exports = {
  sendPushNotification,
};