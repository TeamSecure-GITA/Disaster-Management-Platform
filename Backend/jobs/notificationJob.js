const cron = require("node-cron");
const notificationService = require("../services/notificationService");

const startNotificationJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log("Processing pending notifications...");

      if (
        notificationService &&
        typeof notificationService.processPendingNotifications ===
          "function"
      ) {
        await notificationService.processPendingNotifications();
      }

      console.log("Notification job completed");
    } catch (error) {
      console.error(
        "Notification job error:",
        error.message
      );
    }
  });

  console.log("Notification job started");
};

module.exports = startNotificationJob;