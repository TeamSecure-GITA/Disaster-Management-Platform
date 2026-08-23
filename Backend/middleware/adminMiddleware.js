const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const adminRoles = [
    "admin",
    "super_admin",
  ];

  if (!adminRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Administrator access required.",
    });
  }

  next();
};

const operationsOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  if (!["admin", "operator"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Operations access required." });
  }

  next();
};

const superAdminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Super administrator access required.",
    });
  }

  next();
};

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
      });
    }

    next();
  };
};

module.exports = {
  adminOnly,
  operationsOnly,
  superAdminOnly,
  allowRoles,
};