const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: errors.array().map((error) => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value,
      })),
    });
  }

  next();
};

const validateObjectId = (
  fieldName,
  location = "params"
) => {
  return (req, res, next) => {
    const mongoose = require("mongoose");

    const value =
      req[location] &&
      req[location][fieldName];

    if (!value) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} is required.`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(value)) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} is not a valid ID.`,
      });
    }

    next();
  };
};

module.exports = {
  validate,
  validateObjectId,
};