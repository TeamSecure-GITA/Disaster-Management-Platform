const express = require("express");

const {
  register,
  login,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidator");

const {
  validate: validationMiddleware,
} = require("../middleware/validationMiddleware");
const { authLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

// Register
router.post(
  "/register",
  authLimiter,
  registerValidator,
  validationMiddleware,
  register
);

// Login
router.post(
  "/login",
  authLimiter,
  loginValidator,
  validationMiddleware,
  login
);

router.get("/me", protect, getMe);

module.exports = router;