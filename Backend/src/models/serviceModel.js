const pool = require("../config/db");

const TABLE_NAME = "service_repas";

async function findAll() {
  const sql = `
    SELECT
      id_service,
      type_repas,
      heure_debut,
      heure_fin,
      created_at,
      updated_at
    FROM ${TABLE_NAME}
    ORDER BY
      CASE type_repas
        WHEN 'DEJEUNER' THEN 1
        WHEN 'DINER' THEN 2
        ELSE 3
      END,
      id_service ASC
  `;

  const [rows] = await pool.query(sql);
  return rows;
}

async function findById(idService) {
  const sql = `
    SELECT
      id_service,
      type_repas,
      heure_debut,
      heure_fin,
      created_at,
      updated_at
    FROM ${TABLE_NAME}
    WHERE id_service = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [idService]);
  return rows[0] || null;
}

async function create(serviceData) {
  const { type_repas, heure_debut, heure_fin } = serviceData;

  const sql = `
    INSERT INTO ${TABLE_NAME} (
      type_repas,
      heure_debut,
      heure_fin
    )
    VALUES (?, ?, ?)
  `;

  const [result] = await pool.query(sql, [
    type_repas,
    heure_debut,
    heure_fin,
  ]);

  return findById(result.insertId);
}

async function update(idService, serviceData) {
  const { type_repas, heure_debut, heure_fin } = serviceData;

  const sql = `
    UPDATE ${TABLE_NAME}
    SET
      type_repas = ?,
      heure_debut = ?,
      heure_fin = ?
    WHERE id_service = ?
  `;

  const [result] = await pool.query(sql, [
    type_repas,
    heure_debut,
    heure_fin,
    idService,
  ]);

  return {
    affectedRows: result.affectedRows,
    service: result.affectedRows > 0 ? await findById(idService) : null,
  };
}

async function remove(idService) {
  const sql = `
    DELETE FROM ${TABLE_NAME}
    WHERE id_service = ?
  `;

  const [result] = await pool.query(sql, [idService]);

  return {
    affectedRows: result.affectedRows,
  };
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  delete: remove,
};

