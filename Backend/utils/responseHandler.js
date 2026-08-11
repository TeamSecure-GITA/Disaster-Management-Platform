const successResponse = (
  res,
  data = null,
  message = "Request successful",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const createdResponse = (
  res,
  data = null,
  message = "Resource created successfully"
) => {
  return successResponse(
    res,
    data,
    message,
    201
  );
};

const noContentResponse = (res) => {
  return res.status(204).send();
};

const errorResponse = (
  res,
  message = "Something went wrong",
  statusCode = 500,
  errors = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};

const badRequestResponse = (
  res,
  message = "Bad request",
  errors = null
) => {
  return errorResponse(
    res,
    message,
    400,
    errors
  );
};

const unauthorizedResponse = (
  res,
  message = "Unauthorized"
) => {
  return errorResponse(
    res,
    message,
    401
  );
};

const forbiddenResponse = (
  res,
  message = "Forbidden"
) => {
  return errorResponse(
    res,
    message,
    403
  );
};

const notFoundResponse = (
  res,
  message = "Resource not found"
) => {
  return errorResponse(
    res,
    message,
    404
  );
};

const conflictResponse = (
  res,
  message = "Resource already exists"
) => {
  return errorResponse(
    res,
    message,
    409
  );
};

module.exports = {
  successResponse,
  createdResponse,
  noContentResponse,
  errorResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
};