const HazardReport = require("../models/HazardReport");
const CallbackRequest = require("../models/CallbackRequest");

const createHazardReport = async (req, res, next) => {
  try {
    const report = await HazardReport.create({
      user: req.user._id,
      description: req.body.description,
      location: req.body.location,
    });
    res.status(201).json({ success: true, message: "Hazard report submitted successfully", data: report });
  } catch (error) {
    next(error);
  }
};

const getMyHazardReports = async (req, res, next) => {
  try {
    const reports = await HazardReport.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};

const requestCallback = async (req, res, next) => {
  try {
    const existing = await CallbackRequest.findOne({
      user: req.user._id,
      status: { $in: ["queued", "assigned"] },
    });

    if (existing) {
      return res.status(200).json({ success: true, message: "Callback already requested", data: existing });
    }

    const callback = await CallbackRequest.create({ user: req.user._id });
    res.status(201).json({ success: true, message: "Callback requested successfully", data: callback });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHazardReport,
  getMyHazardReports,
  requestCallback,
};
