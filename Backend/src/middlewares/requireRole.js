const AppError = require("../utils/AppError");

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return next(new AppError("Role not found in request", 401));
      }

      const isAllowed = allowedRoles.includes(req.user.role);

      if (!isAllowed) {
        return next(new AppError("Forbidden", 403));
      }

      next();
    } catch (error) {
      return next(new AppError("Authorization error", 500));
    }
  };
};

module.exports = requireRole;