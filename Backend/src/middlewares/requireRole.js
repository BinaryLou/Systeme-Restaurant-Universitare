const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        const err = new Error("Role not found in request");
        err.statusCode = 401;
        return next(err);
      }

      const isAllowed = allowedRoles.includes(req.user.role);

      if (!isAllowed) {
        const err = new Error("Forbidden");
        err.statusCode = 403;
        return next(err);
      }

      next();
    } catch (error) {
      const err = new Error("Authorization error");
      err.statusCode = 500;
      return next(err);
    }
  };
};

module.exports = requireRole;