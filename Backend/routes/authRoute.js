const express = require("express");

const {
  register,
  login,
} = require("../controllers/authController");

const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

const router = express.Router();

// Register
router.post(
  "/register",
  registerValidator,
  validationMiddleware,
  register
);

// Login
router.post(
  "/login",
  loginValidator,
  validationMiddleware,
  login
);

module.exports = router;