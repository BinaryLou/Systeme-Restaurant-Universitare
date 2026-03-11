const crypto = require("crypto");
const AppError = require("../utils/AppError");
const {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
} = require("../utils/jwt");
const {
  findValidRefreshTokenByHash,
  revokeRefreshToken,
  createRefreshToken,
} = require("../models/refreshTokenModel");

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("Refresh token manquant", 401);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError("Refresh token invalide ou expiré", 401);
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const storedToken = await findValidRefreshTokenByHash(tokenHash);

  if (!storedToken) {
    throw new AppError("Refresh token invalide ou introuvable", 401);
  }

  if (
    (decoded.role === "USER" && !storedToken.user_id) ||
    (decoded.role === "ADMIN" && !storedToken.admin_id)
  ) {
    throw new AppError("Refresh token incohérent", 401);
  }

  await revokeRefreshToken(tokenHash);

  const payload = {
    id: decoded.id,
    role: decoded.role,
  };

  const accessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);

  const newTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  const refreshExpiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  await createRefreshToken({
    tokenHash: newTokenHash,
    accountType: decoded.role,
    userId: decoded.role === "USER" ? decoded.id : null,
    adminId: decoded.role === "ADMIN" ? decoded.id : null,
    expiresAt: refreshExpiresAt,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

const logout = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await revokeRefreshToken(tokenHash);
};

module.exports = {
  refreshAccessToken,
  logout,
};