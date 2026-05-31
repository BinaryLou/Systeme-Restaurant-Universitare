const pool = require("../config/db");

const findUserByApogee = async (apogee) => {
  const sql = `
   SELECT 
      id_utilisateur,
      apogee,
      nom,
      prenom,
      email,
      mot_de_passe_hash,
      solde,
      code_qr
    FROM utilisateur
    WHERE apogee = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [apogee]);
  return rows[0] || null;
};

const findUserById = async (idUtilisateur) => {
  const sql = `
    SELECT 
      id_utilisateur,
      apogee,
      nom,
      prenom,
      email,
      mot_de_passe_hash,
      solde,
      code_qr,
      created_at,
      updated_at
    FROM utilisateur
    WHERE id_utilisateur = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [idUtilisateur]);
  return rows[0] || null;
};

const findUserByQrCode = async (codeQr) => {
  const sql = `
    SELECT 
      id_utilisateur,
      apogee,
      nom,
      prenom,
      email,
      solde,
      code_qr,
      created_at,
      updated_at
    FROM utilisateur
    WHERE code_qr = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [codeQr]);
  return rows[0] || null;
};

const findUserQrById = async (idUtilisateur) => {
  const sql = `
    SELECT 
      id_utilisateur,
      apogee,
      nom,
      prenom,
      email,
      code_qr
    FROM utilisateur
    WHERE id_utilisateur = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [idUtilisateur]);
  return rows[0] || null;
};


const findUserByEmail = async (email) => {
  const sql = `
    SELECT
      id_utilisateur,
      nom,
      prenom,
      email,
      apogee,
      mot_de_passe_hash
    FROM utilisateur
    WHERE LOWER(email) = LOWER(?)
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [email]);
  return rows[0] || null;
};
const updateUserPasswordById = async (
  connection,
  idUtilisateur,
  passwordHash
) => {
  const sql = `
    UPDATE utilisateur
    SET mot_de_passe_hash = ?,
        updated_at = NOW()
    WHERE id_utilisateur = ?
  `;

  const [result] = await connection.execute(sql, [
    passwordHash,
    idUtilisateur,
  ]);

  return result;
};

const updateUserPassword = async (idUtilisateur, passwordHash) => {
  const sql = `
    UPDATE utilisateur
    SET mot_de_passe_hash = ?,
        updated_at = NOW()
    WHERE id_utilisateur = ?
  `;

  const [result] = await pool.execute(sql, [passwordHash, idUtilisateur]);
  return result.affectedRows > 0;
};

const getAllUsers = async (searchTerm = "") => {
  let sql = `
    SELECT 
      id_utilisateur,
      apogee,
      nom,
      prenom,
      email,
      solde,
      created_at
    FROM utilisateur
  `;
  const params = [];

  if (searchTerm) {
    sql += ` WHERE nom LIKE ? OR prenom LIKE ? OR apogee LIKE ? OR email LIKE ?`;
    const term = `%${searchTerm}%`;
    params.push(term, term, term, term);
  }

  sql += ` ORDER BY created_at DESC`;

  const [rows] = await pool.execute(sql, params);
  return rows;
};

const createUser = async ({ apogee, nom, prenom, email, mot_de_passe_hash, code_qr, solde = 0 }) => {
  const sql = `
    INSERT INTO utilisateur (apogee, nom, prenom, email, mot_de_passe_hash, code_qr, solde)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.execute(sql, [apogee, nom, prenom, email, mot_de_passe_hash, code_qr, solde]);
  return result.insertId;
};

const updateUser = async (id, { apogee, nom, prenom, email }) => {
  const sql = `
    UPDATE utilisateur
    SET apogee = ?, nom = ?, prenom = ?, email = ?, updated_at = NOW()
    WHERE id_utilisateur = ?
  `;
  const [result] = await pool.execute(sql, [apogee, nom, prenom, email, id]);
  return result.affectedRows > 0;
};

const deleteUser = async (id) => {
  const sql = `DELETE FROM utilisateur WHERE id_utilisateur = ?`;
  const [result] = await pool.execute(sql, [id]);
  return result.affectedRows > 0;
};

const updateUserBalance = async (id, newBalance) => {
  const sql = `
    UPDATE utilisateur
    SET solde = ?, updated_at = NOW()
    WHERE id_utilisateur = ?
  `;
  const [result] = await pool.execute(sql, [newBalance, id]);
  return result.affectedRows > 0;
};

module.exports = {
  findUserByApogee,
  findUserById,
  findUserByQrCode,
  findUserQrById,
  findUserByEmail,
  updateUserPasswordById,
  updateUserPassword,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserBalance,
};