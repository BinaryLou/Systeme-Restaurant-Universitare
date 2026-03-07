// src/models/refreshTokenModel.js
const pool = require("../config/db");

const createRefreshToken = async ({
  tokenHash,
  accountType,
  userId,
  adminId,
  expiresAt,
}) => {
  const sql = `
    INSERT INTO refresh_tokens (
      token_hash,
      account_type,
      user_id,
      admin_id,
      expires_at
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await pool.execute(sql, [
    tokenHash,
    accountType,
    userId,
    adminId,
    expiresAt,
  ]);

  return result.insertId;
};

module.exports = {
  createRefreshToken,
};