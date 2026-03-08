const { verifyAccessToken } = require("../utils/jwt");
const AppError = require("../utils/AppError");

function getBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== "string") return null;

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;

  return token.trim();
}

const verifyJwt = (req, res, next) => {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return next(new AppError("Missing Token", 401));
    }

    const decoded = verifyAccessToken(token);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    return next();
  } catch (e) {
    return next(new AppError("Invalid or expired token", 401));
  }
};

module.exports = verifyJwt;