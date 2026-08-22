const crypto = require("crypto");
const { logger } = require("../utils/logger");

const requestLogger = (req, res, next) => {
  const requestId = req.get("x-request-id") || crypto.randomUUID();
  const startedAt = process.hrtime.bigint();

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    const responseTime = Number(process.hrtime.bigint() - startedAt) / 1e6;

    logger.request(req, res.statusCode, Math.round(responseTime));
  });

  next();
};

module.exports = requestLogger;