const pool = require("../config/db");

const findAdminByEmail = async (email) => {
  const [rows] = await pool.execute(
    `SELECT id_admin, email,nom,
     prenom, mot_de_passe_hash
     FROM administrateur
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  return rows[0] || null;
};

const findAdminById = async (idAdmin) => {
  const [rows] = await pool.execute(
    `SELECT id_admin, email, nom, prenom, mot_de_passe_hash
     FROM administrateur
     WHERE id_admin = ?
     LIMIT 1`,
    [idAdmin]
  );

  return rows[0] || null;
};

const updateAdminPasswordById = async (idAdmin, passwordHash) => {
  const [result] = await pool.execute(
    `UPDATE administrateur
     SET mot_de_passe_hash = ?
     WHERE id_admin = ?`,
    [passwordHash, idAdmin]
  );

  return result.affectedRows > 0;
};

module.exports = {
  findAdminByEmail,
  findAdminById,
  updateAdminPasswordById
};