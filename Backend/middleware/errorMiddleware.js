const errorHandler = (
  err,
  req,
  res,
  next
) => {
  console.error("ERROR:", err);

  let statusCode =
    err.statusCode ||
    err.status ||
    500;

  let message =
    err.message ||
    "Internal server error.";

  if (statusCode >= 500) {
    message = "Internal server error.";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;

    const errors = Object.values(
      err.errors
    ).map((error) => ({
      field: error.path,
      message: error.message,
    }));

    return res.status(statusCode).json({
      success: false,
      message: "Database validation failed.",
      errors,
    });
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID.";
  }

  if (err.code === 11000) {
    statusCode = 409;

    const fields = Object.keys(
      err.keyPattern || {}
    );

    message = `Duplicate value for field(s): ${fields.join(
      ", "
    )}.`;
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token has expired.";
  }

  if (message === "User already exists") {
    statusCode = 409;
  }

  if (message === "Invalid email or password") {
    statusCode = 401;
  }

  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

const notFoundHandler = (
  req,
  res
) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(
      fn(req, res, next)
    ).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};