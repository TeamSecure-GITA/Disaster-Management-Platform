const jwt = require("jsonwebtoken");

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 ||
      ["CHANGE_ME", "replace-with-a-long-random-secret"].includes(process.env.JWT_SECRET)) {
    throw new Error("A strong JWT_SECRET must be configured.");
  }

  return process.env.JWT_SECRET;
};

const generateToken = (user, type = "access", expiresIn = null) => {
  if (!user || (!user._id && !user.id)) {
    throw new Error("User information is required to generate token");
  }

  const userId = (user._id || user.id).toString();

  const payload = {
    id: userId,
    role: user.role || "user",
    tokenVersion: Number(user.tokenVersion || 0),
    type,
  };

  const tokenExpiresIn =
    expiresIn ||
    (type === "refresh"
      ? process.env.JWT_REFRESH_EXPIRES_IN || "30d"
      : process.env.JWT_EXPIRES_IN || "7d");

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: tokenExpiresIn,
  });
};

const verifyToken = (token) => {
  if (!token) {
    throw new Error("Token is required");
  }

  return jwt.verify(token, getJwtSecret());
};

module.exports = {
  generateToken,
  verifyToken,
};