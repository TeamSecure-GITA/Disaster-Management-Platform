const SOS = require("../models/SOS");

const createSOS = async (req, res, next) => {
  try {
    const sos = await SOS.create({
      ...req.body,
      user: req.user ? req.user._id : undefined,
    });

    res.status(201).json({
      success: true,
      message: "SOS request created successfully",
      data: sos,
    });
  } catch (error) {
    next(error);
  }
};

const getSOSRequests = async (req, res, next) => {
  try {
    const requests = await SOS.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

const getSOSById = async (req, res, next) => {
  try {
    const sos = await SOS.findById(req.params.id);

    if (!sos) {
      return res.status(404).json({
        success: false,
        message: "SOS request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: sos,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSOS,
  getSOSRequests,
  getSOSById,
};