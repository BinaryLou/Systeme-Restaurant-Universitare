const crypto = require("crypto");
const AppError = require("../utils/AppError");
const { verifyRefreshToken, signAccessToken } = require("../utils/jwt");
const { findValidRefreshTokenByHash } = require("../models/refreshTokenModel");

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

  const payload = {
    id: decoded.id,
    role: decoded.role,
  };

  const accessToken = signAccessToken(payload);

  return {
    accessToken,
  };
};

module.exports = {
  refreshAccessToken,
};