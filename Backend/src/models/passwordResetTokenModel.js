const db = require("../config/db");

const createResetToken = async (connection, userId, tokenHash, expiresAt) => {
  const sql = `
    INSERT INTO password_reset_tokens (
      id_utilisateur,
      token_hash,
      expires_at
    )
    VALUES (?, ?, ?)
  `;

  const [result] = await connection.execute(sql, [userId, tokenHash, expiresAt]);

  return {
    id_reset_token: result.insertId,
    id_utilisateur: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  };
};

const findValidTokenByHash = async (tokenHash) => {
  const sql = `
    SELECT
      id_reset_token,
      id_utilisateur,
      token_hash,
      expires_at,
      used_at,
      created_at
    FROM password_reset_tokens
    WHERE token_hash = ?
      AND used_at IS NULL
      AND expires_at > NOW()
    LIMIT 1
  `;

  const [rows] = await db.execute(sql, [tokenHash]);
  return rows[0] || null;
};

const findTokenByHash = async (tokenHash) => {
  const sql = `
    SELECT
      id_reset_token,
      id_utilisateur,
      token_hash,
      expires_at,
      used_at,
      created_at
    FROM password_reset_tokens
    WHERE token_hash = ?
    LIMIT 1
  `;

  const [rows] = await db.execute(sql, [tokenHash]);
  return rows[0] || null;
};

const markTokenAsUsed = async (connection, tokenId) => {
  const sql = `
    UPDATE password_reset_tokens
    SET used_at = NOW()
    WHERE id_reset_token = ?
      AND used_at IS NULL
  `;

  const [result] = await connection.execute(sql, [tokenId]);
  return result.affectedRows > 0;
};

const deleteTokensForUser = async (connection, userId) => {
  const sql = `
    DELETE FROM password_reset_tokens
    WHERE id_utilisateur = ?
  `;

  const [result] = await connection.execute(sql, [userId]);
  return result.affectedRows;
};

const deleteExpiredTokens = async () => {
  const sql = `
    DELETE FROM password_reset_tokens
    WHERE expires_at <= NOW()
  `;

  const [result] = await db.execute(sql);
  return result.affectedRows;
};

const revokeOtherActiveTokensForUser = async (connection, userId) => {
  const sql = `
    UPDATE password_reset_tokens
    SET used_at = NOW()
    WHERE id_utilisateur = ?
      AND used_at IS NULL
      AND expires_at > NOW()
  `;

  const [result] = await connection.execute(sql, [userId]);
  return result.affectedRows;
};

module.exports = {
  createResetToken,
  findValidTokenByHash,
  findTokenByHash,
  markTokenAsUsed,
  deleteTokensForUser,
  deleteExpiredTokens,
  revokeOtherActiveTokensForUser,
};