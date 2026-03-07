// src/models/userModel.js
const pool = require("../config/db");

const findUserByApogee = async (apogee) => {
  const sql = `
    SELECT 
      id_utilisateur,
      apogee,
      nom,
      prenom,
      email,
      mot_de_passe_hash
    FROM utilisateur
    WHERE apogee = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [apogee]);
  return rows[0] || null;
};

module.exports = {
  findUserByApogee,
};