const jwt = require("jsonwebtoken");

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "CHANGE_ME") {
    throw new Error("A strong JWT_SECRET must be configured.");
  }

  return process.env.JWT_SECRET;
};

const generateToken = (user) => {
  if (!user || !user._id) {
    throw new Error("User information is required to generate token");
  }

  const payload = {
    id: user._id.toString(),
    role: user.role || "user",
  };

  return jwt.sign(
    { ...payload, type: "access" },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
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