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

module.exports = {
  findAdminByEmail
};