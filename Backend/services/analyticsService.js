const Analytics = require("../models/Analytics");

const createAnalyticsRecord = async (data) => {
  return await Analytics.create(data);
};

const getAnalytics = async (filters = {}) => {
  return await Analytics.find(filters)
    .sort({ createdAt: -1 });
};

module.exports = {
  createAnalyticsRecord,
  getAnalytics,
};