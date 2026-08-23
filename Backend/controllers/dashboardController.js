const dashboardService = require("../services/dashboardService");

const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getDashboardSummary(req.user._id);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary };
