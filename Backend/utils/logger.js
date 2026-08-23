const fs = require("fs");
const path = require("path");

// ============================================================
// LOG DIRECTORY
// ============================================================

const logsDirectory = path.join(
  __dirname,
  "..",
  "logs"
);

if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, {
    recursive: true,
  });
}

// ============================================================
// LOG FILES
// ============================================================

const logFiles = {
  access: path.join(
    logsDirectory,
    "access.log"
  ),

  error: path.join(
    logsDirectory,
    "error.log"
  ),

  combined: path.join(
    logsDirectory,
    "combined.log"
  ),
};

// ============================================================
// FORMAT MESSAGE
// ============================================================

const formatMessage = (
  level,
  message,
  metadata = null
) => {
  const timestamp =
    new Date().toISOString();

  let formattedMessage = String(message);

  let formattedMetadata = "";

  if (metadata !== null) {
    try {
      formattedMetadata =
        ` ${JSON.stringify(metadata)}`;
    } catch (serializationError) {
      formattedMetadata =
        " [Unable to serialize metadata]";
    }
  }

  return (
    `[${timestamp}] [${level}] ` +
    `${formattedMessage}` +
    `${formattedMetadata}\n`
  );
};

// ============================================================
// WRITE LOG
// ============================================================

const writeLog = (
  file,
  level,
  message,
  metadata = null
) => {
  const formattedMessage =
    formatMessage(
      level,
      message,
      metadata
    );

  try {
    fs.appendFileSync(
      file,
      formattedMessage,
      "utf8"
    );
  } catch (writeError) {
    console.error(
      "Failed to write log:",
      writeError.message
    );
  }

  return formattedMessage;
};

// ============================================================
// INFO
// ============================================================

const info = (
  message,
  metadata = null
) => {
  const output = writeLog(
    logFiles.combined,
    "INFO",
    message,
    metadata
  );

  console.log(output.trim());

  return output;
};

// ============================================================
// WARNING
// ============================================================

const warn = (
  message,
  metadata = null
) => {
  const output = writeLog(
    logFiles.combined,
    "WARN",
    message,
    metadata
  );

  console.warn(output.trim());

  return output;
};

// ============================================================
// ERROR
// ============================================================

const error = (
  message,
  metadata = null
) => {
  const output = writeLog(
    logFiles.error,
    "ERROR",
    message,
    metadata
  );

  writeLog(
    logFiles.combined,
    "ERROR",
    message,
    metadata
  );

  console.error(output.trim());

  return output;
};

// ============================================================
// ACCESS LOG
// ============================================================

const access = (
  message,
  metadata = null
) => {
  const output = writeLog(
    logFiles.access,
    "ACCESS",
    message,
    metadata
  );

  writeLog(
    logFiles.combined,
    "ACCESS",
    message,
    metadata
  );

  return output;
};

// ============================================================
// DEBUG
// ============================================================

const debug = (
  message,
  metadata = null
) => {
  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    const output = writeLog(
      logFiles.combined,
      "DEBUG",
      message,
      metadata
    );

    console.debug(
      output.trim()
    );

    return output;
  }

  return null;
};

// ============================================================
// EXPRESS REQUEST LOGGER
// ============================================================

const request = (
  req,
  statusCode = 200,
  responseTime = null
) => {
  const requestUrl = req.originalUrl || req.url || "unknown";
  const metadata = {
    method: req.method,
    url: requestUrl.split("?")[0],
    ip:
      req.ip ||
      req.connection?.remoteAddress ||
      "unknown",
    userAgent:
      req.get?.("user-agent") ||
      "unknown",
    statusCode,
  };

  if (responseTime !== null) {
    metadata.responseTime =
      `${responseTime}ms`;
  }

  return access(
    "HTTP request",
    metadata
  );
};

// ============================================================
// DATABASE LOGGER
// ============================================================

const database = (
  message,
  metadata = null
) => {
  return info(
    `Database: ${message}`,
    metadata
  );
};

// ============================================================
// AUTHENTICATION LOGGER
// ============================================================

const auth = (
  message,
  metadata = null
) => {
  return info(
    `Authentication: ${message}`,
    metadata
  );
};

// ============================================================
// SECURITY LOGGER
// ============================================================

const security = (
  message,
  metadata = null
) => {
  return warn(
    `Security: ${message}`,
    metadata
  );
};

// ============================================================
// ERROR OBJECT LOGGER
// ============================================================

const errorObject = (
  message,
  err,
  metadata = {}
) => {
  const errorMetadata = {
    ...metadata,
    errorName:
      err?.name || "Error",
    errorMessage:
      err?.message || "Unknown error",
    stack:
      err?.stack || null,
  };

  return error(
    message,
    errorMetadata
  );
};

// ============================================================
// LOGGER OBJECT
// ============================================================

const logger = {
  info,
  warn,
  error,
  access,
  debug,
  request,
  database,
  auth,
  security,
  errorObject,
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  logger,

  info,
  warn,
  error,
  access,
  debug,

  request,
  database,
  auth,
  security,
  errorObject,

  logFiles,
};