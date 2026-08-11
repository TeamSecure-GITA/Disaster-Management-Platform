const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  if (!user || !user._id) {
    throw new Error("User information is required to generate token");
  }

  const payload = {
    id: user._id.toString(),
    role: user.role || "user",
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

const verifyToken = (token) => {
  if (!token) {
    throw new Error("Token is required");
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};