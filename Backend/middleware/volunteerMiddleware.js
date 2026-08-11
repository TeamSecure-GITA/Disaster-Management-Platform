const Volunteer = require("../models/Volunteer");

const volunteerOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (
      req.user.role !== "volunteer" &&
      req.user.role !== "admin" &&
      req.user.role !== "super_admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Volunteer access required.",
      });
    }

    if (
      req.user.role === "admin" ||
      req.user.role === "super_admin"
    ) {
      return next();
    }

    const volunteer = await Volunteer.findOne({
      user: req.user._id,
    });

    if (!volunteer) {
      return res.status(403).json({
        success: false,
        message: "Volunteer profile not found.",
      });
    }

    if (
      volunteer.status !== "approved" &&
      volunteer.status !== "active"
    ) {
      return res.status(403).json({
        success: false,
        message: "Your volunteer account is not active.",
      });
    }

    req.volunteer = volunteer;

    next();
  } catch (error) {
    next(error);
  }
};

const approvedVolunteerOnly = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (
      req.user.role === "admin" ||
      req.user.role === "super_admin"
    ) {
      return next();
    }

    const volunteer = await Volunteer.findOne({
      user: req.user._id,
    });

    if (!volunteer) {
      return res.status(403).json({
        success: false,
        message: "Volunteer profile not found.",
      });
    }

    if (
      volunteer.status !== "approved" &&
      volunteer.status !== "active"
    ) {
      return res.status(403).json({
        success: false,
        message: "Approved volunteer access required.",
      });
    }

    req.volunteer = volunteer;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  volunteerOnly,
  approvedVolunteerOnly,
};