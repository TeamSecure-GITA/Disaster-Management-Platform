const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { logger } = require("../utils/logger");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      logger.security("Authentication required", {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection?.remoteAddress || "unknown",
        requestId: req.requestId || null,
      });
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a valid token.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select(
      "-password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User associated with this token was not found.",
      });
    }

    if (
      user.isActive === false ||
      user.status === "inactive"
    ) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      logger.security("Expired authentication token", {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection?.remoteAddress || "unknown",
        requestId: req.requestId || null,
      });
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      logger.security("Invalid authentication token", {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection?.remoteAddress || "unknown",
        requestId: req.requestId || null,
      });
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return next();
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select(
      "-password"
    );

    if (user) {
      req.user = user;
      req.userId = user._id;
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  protect,
  optionalAuth,
};