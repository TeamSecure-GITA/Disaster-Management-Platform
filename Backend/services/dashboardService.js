const Alert = require("../models/Alert");
const SOS = require("../models/SOS");
const Shelter = require("../models/Shelter");
const DamageAssessment = require("../models/DamageAssessment");
const Notification = require("../models/Notification");
const Family = require("../models/Family");

const getDashboardSummary = async (userId) => {
  const [activeAlerts, activeSOS, openShelters, pendingReports, unreadNotifications, family] =
    await Promise.all([
      Alert.countDocuments({ status: "active" }),
      SOS.countDocuments({ status: { $in: ["active", "acknowledged", "responding"] } }),
      Shelter.countDocuments({ status: "open" }),
      DamageAssessment.countDocuments({ status: { $in: ["submitted", "under_review"] } }),
      Notification.countDocuments({ recipient: userId, isRead: false }),
      Family.findOne({ user: userId }).select("members.isSafe"),
    ]);

  const members = family?.members || [];
  const safeMembers = members.filter((member) => member.isSafe).length;

  return {
    alerts: { active: activeAlerts },
    rescueOperations: { activeSOS },
    shelters: { open: openShelters },
    reports: { pending: pendingReports },
    notifications: { unread: unreadNotifications },
    family: { total: members.length, safe: safeMembers },
    generatedAt: new Date().toISOString(),
  };
};

module.exports = { getDashboardSummary };
