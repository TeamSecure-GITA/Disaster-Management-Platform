const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateToken, verifyToken } = require("../utils/generateToken");

const buildAuthResponse = (user) => ({
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
  token: generateToken(
    { _id: user._id, role: user.role, tokenVersion: user.tokenVersion },
    "access"
  ),
  refreshToken: generateToken(
    { _id: user._id, role: user.role, tokenVersion: user.tokenVersion },
    "refresh"
  ),
});

const registerUser = async (userData) => {
  const { name, email, password } = userData;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const isHeadAdmin = email.toLowerCase() === "debasishn185@gmail.com";
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: isHeadAdmin ? "admin" : (userData.role || "user"),
  });

  return buildAuthResponse(user);
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (user.isActive === false || user.status === "inactive") {
    const error = new Error("Your account is inactive");
    error.statusCode = 403;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (user.email.toLowerCase() === "debasishn185@gmail.com" && user.role !== "admin") {
    user.role = "admin";
  }
  user.lastLogin = new Date();
  await user.save();

  return buildAuthResponse(user);
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error("Refresh token is required");
    error.statusCode = 401;
    throw error;
  }

  const decoded = verifyToken(refreshToken);

  if (decoded.type !== "refresh") {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    const error = new Error("User associated with this token was not found.");
    error.statusCode = 401;
    throw error;
  }

  if (user.isActive === false || user.status === "inactive") {
    const error = new Error("Your account is inactive.");
    error.statusCode = 403;
    throw error;
  }

  return {
    token: generateToken(
      { _id: user._id, role: user.role, tokenVersion: user.tokenVersion },
      "access"
    ),
    refreshToken: generateToken(
      { _id: user._id, role: user.role, tokenVersion: user.tokenVersion },
      "refresh"
    ),
  };
};

const logoutUser = async (userId) => {
  return User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(currentPassword, user.password);

  if (!passwordMatch) {
    const error = new Error("Current password is incorrect");
    error.statusCode = 401;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.tokenVersion += 1;
  await user.save();

  return true;
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changePassword,
};