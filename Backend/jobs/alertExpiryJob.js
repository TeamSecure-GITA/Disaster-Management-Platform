const cron = require("node-cron");
const Alert = require("../models/Alert");

const startAlertExpiryJob = () => {
  // Runs every minute
  const task = cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const result = await Alert.updateMany(
        {
          expiresAt: { $lte: now },
          status: "active",
        },
        {
          $set: {
            status: "expired",
          },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(
          `${result.modifiedCount} alert(s) expired`
        );
      }
    } catch (error) {
      console.error(
        "Alert expiry job error:",
        error.message
      );
    }
  });

  console.log("Alert expiry job started");
  return task;
};

module.exports = startAlertExpiryJob;