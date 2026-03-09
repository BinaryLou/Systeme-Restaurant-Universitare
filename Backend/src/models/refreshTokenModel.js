const pool = require("../config/db");

const createRefreshToken = async ({
  tokenHash,
  accountType,
  userId = null,
  adminId = null,
  expiresAt
}) => {
  const sql = `
    INSERT INTO refresh_tokens
    (token_hash, account_type, user_id, admin_id, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await pool.execute(sql, [
    tokenHash,
    accountType,
    userId,
    adminId,
    expiresAt
  ]);

  return result.insertId;
};


const findByTokenHash = async (tokenHash) => {
  const sql = `
    SELECT *
    FROM refresh_tokens
    WHERE token_hash = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [tokenHash]);

  return rows[0] || null;
};


const revokeRefreshToken = async (tokenHash) => {
  const sql = `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE token_hash = ?
  `;

  const [result] = await pool.execute(sql, [tokenHash]);

  return result.affectedRows;
};


const deleteExpiredTokens = async () => {
  const sql = `
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW()
  `;

  const [result] = await pool.execute(sql);

  return result.affectedRows;
};

const findValidRefreshTokenByHash = async (tokenHash) => {
  const sql = `
    SELECT
      id_refresh_token,
      token_hash,
      account_type,
      user_id,
      admin_id,
      expires_at,
      revoked_at
    FROM refresh_tokens
    WHERE token_hash = ?
      AND revoked_at IS NULL
      AND expires_at > NOW()
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [tokenHash]);
  return rows[0] || null;
};



module.exports = {
  createRefreshToken,
  findByTokenHash,
  revokeRefreshToken,
  deleteExpiredTokens ,
  findValidRefreshTokenByHash
};