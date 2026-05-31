const db = require("../config/db");

const createResetToken = async (connection, adminId, tokenHash, expiresAt) => {
  const sql = `
    INSERT INTO admin_password_reset_tokens (
      id_admin,
      token_hash,
      expires_at
    )
    VALUES (?, ?, ?)
  `;

  const [result] = await connection.execute(sql, [adminId, tokenHash, expiresAt]);

  return {
    id_reset_token: result.insertId,
    id_admin: adminId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  };
};

const findValidTokenByHash = async (tokenHash) => {
  const sql = `
    SELECT
      id_reset_token,
      id_admin,
      token_hash,
      expires_at,
      used_at,
      created_at
    FROM admin_password_reset_tokens
    WHERE token_hash = ?
      AND used_at IS NULL
      AND expires_at > NOW()
    LIMIT 1
  `;

  const [rows] = await db.execute(sql, [tokenHash]);
  return rows[0] || null;
};

const markTokenAsUsed = async (connection, tokenId) => {
  const sql = `
    UPDATE admin_password_reset_tokens
    SET used_at = NOW()
    WHERE id_reset_token = ?
      AND used_at IS NULL
  `;

  const [result] = await connection.execute(sql, [tokenId]);
  return result.affectedRows > 0;
};

const deleteTokensForAdmin = async (connection, adminId) => {
  const sql = `
    DELETE FROM admin_password_reset_tokens
    WHERE id_admin = ?
  `;

  const [result] = await connection.execute(sql, [adminId]);
  return result.affectedRows;
};

const deleteExpiredTokens = async () => {
  const sql = `
    DELETE FROM admin_password_reset_tokens
    WHERE expires_at <= NOW()
  `;

  const [result] = await db.execute(sql);
  return result.affectedRows;
};

const revokeOtherActiveTokensForAdmin = async (connection, adminId) => {
  const sql = `
    UPDATE admin_password_reset_tokens
    SET used_at = NOW()
    WHERE id_admin = ?
      AND used_at IS NULL
      AND expires_at > NOW()
  `;

  const [result] = await connection.execute(sql, [adminId]);
  return result.affectedRows;
};

module.exports = {
  createResetToken,
  findValidTokenByHash,
  markTokenAsUsed,
  deleteTokensForAdmin,
  deleteExpiredTokens,
  revokeOtherActiveTokensForAdmin,
};
