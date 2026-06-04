const jwt = require("jsonwebtoken");
require("dotenv").config()

function normalizePayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("JWT payload must be an object");
  }
  return payload;
}

function signAccessToken(payload) {
  const safePayload = normalizePayload(payload);
  return jwt.sign(safePayload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    issuer: "ru-digital-api",
  });
}

function signRefreshToken(payload) {
  const safePayload = normalizePayload(payload);
  return jwt.sign(safePayload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    issuer: "ru-digital-api",
  });
}


function verifyAccessToken(token) {
  if (!token) throw new Error("Missing token");
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, {
    issuer: "ru-digital-api",
  });
}

function verifyRefreshToken(token) {
  if (!token) throw new Error("Missing token");
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, {
    issuer: "ru-digital-api",
  });
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};