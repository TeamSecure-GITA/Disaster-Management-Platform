const express = require("express");

const {
  register,
  login,
  getMe,
  refresh,
  logout,
  changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  changePasswordValidator,
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

router.post(
  "/refresh",
  authLimiter,
  refreshTokenValidator,
  validationMiddleware,
  refresh
);

router.post("/logout", protect, logout);

router.patch(
  "/change-password",
  protect,
  changePasswordValidator,
  validationMiddleware,
  changePassword
);

router.get("/me", protect, getMe);

module.exports = router;