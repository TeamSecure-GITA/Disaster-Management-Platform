const fs = require("fs");
const path = require("path");

const logsDirectory = path.join(
  __dirname,
  "..",
  "logs"
);

// Create logs directory if it does not exist
if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, {
    recursive: true,
  });
}

// Log file paths
const logFiles = {
  access: path.join(logsDirectory, "access.log"),
  error: path.join(logsDirectory, "error.log"),
  combined: path.join(logsDirectory, "combined.log"),
};

// Format log message
const formatMessage = (
  level,
  message,
  metadata = null
) => {
  const timestamp = new Date().toISOString();

  let formattedMetadata = "";

  if (metadata !== null) {
    try {
      formattedMetadata = ` ${JSON.stringify(metadata)}`;
    } catch (error) {
      formattedMetadata =
        " [Unable to serialize metadata]";
    }
  }

  return `[${timestamp}] [${level}] ${message}${formattedMetadata}\n`;
};

// Write log to file
const writeLog = (
  file,
  level,
  message,
  metadata = null
) => {
  const formattedMessage = formatMessage(
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
  } catch (error) {
    console.error(
      "Failed to write log:",
      error.message
    );
  }

  return formattedMessage;
};

// INFO log
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

// WARN log
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

// ERROR log
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

// ACCESS log
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

// DEBUG log
const debug = (
  message,
  metadata = null
) => {
  if (process.env.NODE_ENV === "development") {
    const output = writeLog(
      logFiles.combined,
      "DEBUG",
      message,
      metadata
    );

    console.debug(output.trim());

    return output;
  }

  return null;
};

// Logger object
const logger = {
  info,
  warn,
  error,
  access,
  debug,
};

// Export logger
module.exports = {
  logger,
  info,
  warn,
  error,
  access,
  debug,
  logFiles,
};