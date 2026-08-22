const {
  logger,
} = require("../utils/logger");

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

const errorHandler = (
  err,
  req,
  res,
  next
) => {
  // Determine HTTP status code
  const statusCode =
    res.statusCode &&
    res.statusCode >= 400
      ? res.statusCode
      : err.statusCode &&
          err.statusCode >= 400
        ? err.statusCode
        : 500;

  // Determine error message
  const message =
    err.message ||
    "Internal server error";

  // ==========================================================
  // LOG ERROR
  // ==========================================================

  logger.errorObject(
    "Unhandled server error",
    err,
    {
      method: req.method,
      url:
        req.originalUrl ||
        req.url,
      statusCode,
      ip:
        req.ip ||
        req.connection?.remoteAddress ||
        "unknown",
    }
  );

  // ==========================================================
  // DEVELOPMENT RESPONSE
  // ==========================================================

  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    return res
      .status(statusCode)
      .json({
        success: false,
        message,
        error: {
          name:
            err.name ||
            "Error",

          stack:
            err.stack ||
            null,
        },
      });
  }

  // ==========================================================
  // PRODUCTION RESPONSE
  // ==========================================================

  return res
    .status(statusCode)
    .json({
      success: false,
      message:
        statusCode === 500
          ? "Internal server error"
          : message,
    });
};

// ============================================================
// EXPORT
// ============================================================

module.exports = errorHandler;