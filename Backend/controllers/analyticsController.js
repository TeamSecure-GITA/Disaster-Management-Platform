const analyticsService = require("../services/analyticsService");

const createAnalytics = async (req, res, next) => {
  try {
    const analytics =
      await analyticsService.createAnalyticsRecord(req.body);

    res.status(201).json({
      success: true,
      message: "Analytics record created successfully",
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const analytics =
      await analyticsService.getAnalytics(req.query);

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnalytics,
  getAnalytics,
};