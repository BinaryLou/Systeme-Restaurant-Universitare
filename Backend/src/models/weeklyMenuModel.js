const db = require("../config/db");

const parseJsonField = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

const mapWeeklyMenuRow = (row) => {
  if (!row) {
    return null;
  }

  return {
    id_weekly_menu: row.id_weekly_menu,
    day_of_week: row.day_of_week,
    label: row.label,
    lunch_content: parseJsonField(row.lunch_content),
    dinner_content: parseJsonField(row.dinner_content),
    is_published: Boolean(row.is_published),
    is_closed: Boolean(row.is_closed),
    created_by_admin_id: row.created_by_admin_id,
    updated_by_admin_id: row.updated_by_admin_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

const getAllWeeklyMenus = async () => {
  const sql = `
    SELECT
      id_weekly_menu,
      day_of_week,
      label,
      lunch_content,
      dinner_content,
      is_published,
      is_closed,
      created_by_admin_id,
      updated_by_admin_id,
      created_at,
      updated_at
    FROM weekly_menus
    ORDER BY day_of_week ASC
  `;

  const [rows] = await db.query(sql);
  return rows.map(mapWeeklyMenuRow);
};

const getWeeklyMenuByDay = async (dayOfWeek) => {
  const sql = `
    SELECT
      id_weekly_menu,
      day_of_week,
      label,
      lunch_content,
      dinner_content,
      is_published,
      is_closed,
      created_by_admin_id,
      updated_by_admin_id,
      created_at,
      updated_at
    FROM weekly_menus
    WHERE day_of_week = ?
    LIMIT 1
  `;

  const [rows] = await db.query(sql, [dayOfWeek]);
  return mapWeeklyMenuRow(rows[0] || null);
};

const createWeeklyMenu = async (connection, payload) => {
  const sql = `
    INSERT INTO weekly_menus (
      day_of_week,
      label,
      lunch_content,
      dinner_content,
      is_published,
      is_closed,
      created_by_admin_id,
      updated_by_admin_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    payload.day_of_week,
    payload.label,
    payload.lunch_content ? JSON.stringify(payload.lunch_content) : null,
    payload.dinner_content ? JSON.stringify(payload.dinner_content) : null,
    payload.is_published ?? false,
    payload.is_closed ?? false,
    payload.created_by_admin_id,
    payload.updated_by_admin_id ?? null,
  ];

  const [result] = await connection.query(sql, params);

  return {
    id_weekly_menu: result.insertId,
    ...payload,
    is_published: payload.is_published ?? false,
    is_closed: payload.is_closed ?? false,
    updated_by_admin_id: payload.updated_by_admin_id ?? null,
  };
};

const updateWeeklyMenu = async (connection, dayOfWeek, payload) => {
  const sql = `
    UPDATE weekly_menus
    SET
      label = ?,
      lunch_content = ?,
      dinner_content = ?,
      is_published = ?,
      is_closed = ?,
      updated_by_admin_id = ?
    WHERE day_of_week = ?
  `;

  const params = [
    payload.label,
    payload.lunch_content ? JSON.stringify(payload.lunch_content) : null,
    payload.dinner_content ? JSON.stringify(payload.dinner_content) : null,
    payload.is_published ?? false,
    payload.is_closed ?? false,
    payload.updated_by_admin_id ?? null,
    dayOfWeek,
  ];

  const [result] = await connection.query(sql, params);

  return result.affectedRows > 0;
};

const setWeeklyMenuPublishStatus = async (
  connection,
  dayOfWeek,
  isPublished,
  updatedByAdminId = null
) => {
  const sql = `
    UPDATE weekly_menus
    SET
      is_published = ?,
      updated_by_admin_id = ?
    WHERE day_of_week = ?
  `;

  const [result] = await connection.query(sql, [
    isPublished,
    updatedByAdminId,
    dayOfWeek,
  ]);

  return result.affectedRows > 0;
};

module.exports = {
  getAllWeeklyMenus,
  getWeeklyMenuByDay,
  createWeeklyMenu,
  updateWeeklyMenu,
  setWeeklyMenuPublishStatus,
};