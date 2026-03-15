const pool = require("../config/db");

const TABLE_NAME = "service_repas";

async function findAll() {
  const query = `
    SELECT
      id_service,
      type_repas,
      TIME_FORMAT(heure_debut, '%H:%i') AS heure_debut,
      TIME_FORMAT(heure_fin, '%H:%i') AS heure_fin,
      created_at,
      updated_at
    FROM ${TABLE_NAME}
    ORDER BY
      heure_debut ASC
  `;

  const [rows] = await pool.execute(query);
  return rows;
}

async function findById(idService) {
  const query = `
    SELECT
      id_service,
      type_repas,
      TIME_FORMAT(heure_debut, '%H:%i') AS heure_debut,
      TIME_FORMAT(heure_fin, '%H:%i') AS heure_fin,
      created_at,
      updated_at
    FROM ${TABLE_NAME}
    WHERE id_service = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(query, [idService]);
  return rows[0] || null;
}

async function create({ type_repas, heure_debut, heure_fin }) {
  const insertQuery = `
    INSERT INTO ${TABLE_NAME} (
      type_repas,
      heure_debut,
      heure_fin
    ) VALUES (?, ?, ?)
  `;

  const [result] = await pool.execute(insertQuery, [
    type_repas,
    heure_debut,
    heure_fin,
  ]);

  return findById(result.insertId);
}

async function update(idService, { type_repas, heure_debut, heure_fin }) {
  const updateQuery = `
    UPDATE ${TABLE_NAME}
    SET
      type_repas = ?,
      heure_debut = ?,
      heure_fin = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id_service = ?
  `;

  const [result] = await pool.execute(updateQuery, [
    type_repas,
    heure_debut,
    heure_fin,
    idService,
  ]);

  return {
    affectedRows: result.affectedRows,
    service: result.affectedRows ? await findById(idService) : null,
  };
}

async function deleteById(idService) {
  const deleteQuery = `
    DELETE FROM ${TABLE_NAME}
    WHERE id_service = ?
  `;

  const [result] = await pool.execute(deleteQuery, [idService]);

  return {
    affectedRows: result.affectedRows,
  };
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  deleteById,
};