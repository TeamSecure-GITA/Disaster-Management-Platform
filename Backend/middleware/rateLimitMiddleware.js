const rateLimit = require("express-rate-limit");

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again later.",
  },
});

// Standard SOS rate-limit: 10 requests per 5 minutes
const sosLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many SOS requests. Please wait before trying again.",
  },
});

// Threat-block limiter: 5 requests per 60 seconds → 403 + blocked flag.
// The frontend sosService.js detects this and redirects to CERT-In.
const threatBlockLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1-minute rolling window
  limit: 5,                 // 5 hits max before hard block
  standardHeaders: "draft-8",
  legacyHeaders: false,
  statusCode: 403,          // 403 so the frontend's `response.status === 403` check fires
  message: {
    success: false,
    blocked: true,
    message:
      "Suspicious activity detected. This incident has been flagged and you are being redirected to the Cyber Security Authority.",
    redirectUrl: "https://www.cert-in.org.in",
  },
});

const chatLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many chatbot requests. Please try again later.",
  },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many upload requests. Please try again later.",
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  sosLimiter,
  threatBlockLimiter,
  chatLimiter,
  uploadLimiter,
};