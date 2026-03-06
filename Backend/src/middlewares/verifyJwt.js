const { verifyAccessToken } = require("../utils/jwt");

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
      const err = new Error("Missing token");
      err.statusCode = 401;
      return next(err);
    }

    const decoded = verifyAccessToken(token);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    return next();
  } catch (e) {
    const err = new Error("Invalid or expired token");
    err.statusCode = 401;

    if (process.env.NODE_ENV !== "production") err.debug = e.message;

    return next(err);
  }
};

module.exports = verifyJwt;