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

const mapMenuExceptionRow = (row) => {
  if (!row) {
    return null;
  }

  return {
    id_menu_exception: row.id_menu_exception,
    menu_date: row.menu_date,
    weekly_menu_id: row.weekly_menu_id,
    label: row.label,
    lunch_content: parseJsonField(row.lunch_content),
    dinner_content: parseJsonField(row.dinner_content),
    is_published: Boolean(row.is_published),
    is_closed: Boolean(row.is_closed),
    reason: row.reason,
    created_by_admin_id: row.created_by_admin_id,
    updated_by_admin_id: row.updated_by_admin_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

const getExceptionByDate = async (menuDate) => {
  const sql = `
    SELECT
      id_menu_exception,
      menu_date,
      weekly_menu_id,
      label,
      lunch_content,
      dinner_content,
      is_published,
      is_closed,
      reason,
      created_by_admin_id,
      updated_by_admin_id,
      created_at,
      updated_at
    FROM menu_exceptions
    WHERE menu_date = ?
    LIMIT 1
  `;

  const [rows] = await db.query(sql, [menuDate]);
  return mapMenuExceptionRow(rows[0] || null);
};

const getExceptionById = async (id) => {
  const sql = `
    SELECT
      id_menu_exception,
      menu_date,
      weekly_menu_id,
      label,
      lunch_content,
      dinner_content,
      is_published,
      is_closed,
      reason,
      created_by_admin_id,
      updated_by_admin_id,
      created_at,
      updated_at
    FROM menu_exceptions
    WHERE id_menu_exception = ?
    LIMIT 1
  `;

  const [rows] = await db.query(sql, [id]);
  return mapMenuExceptionRow(rows[0] || null);
};

const createMenuException = async (connection, payload) => {
  const sql = `
    INSERT INTO menu_exceptions (
      menu_date,
      weekly_menu_id,
      label,
      lunch_content,
      dinner_content,
      is_published,
      is_closed,
      reason,
      created_by_admin_id,
      updated_by_admin_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    payload.menu_date,
    payload.weekly_menu_id ?? null,
    payload.label,
    payload.lunch_content ? JSON.stringify(payload.lunch_content) : null,
    payload.dinner_content ? JSON.stringify(payload.dinner_content) : null,
    payload.is_published ?? false,
    payload.is_closed ?? false,
    payload.reason ?? null,
    payload.created_by_admin_id,
    payload.updated_by_admin_id ?? null,
  ];

  const [result] = await connection.query(sql, params);

  return {
    id_menu_exception: result.insertId,
    ...payload,
    weekly_menu_id: payload.weekly_menu_id ?? null,
    lunch_content: payload.lunch_content ?? null,
    dinner_content: payload.dinner_content ?? null,
    is_published: payload.is_published ?? false,
    is_closed: payload.is_closed ?? false,
    reason: payload.reason ?? null,
    updated_by_admin_id: payload.updated_by_admin_id ?? null,
  };
};

const updateMenuException = async (connection, id, payload) => {
  const fields = [];
  const params = [];

  if (payload.menu_date !== undefined) {
    fields.push("menu_date = ?");
    params.push(payload.menu_date);
  }

  if (payload.weekly_menu_id !== undefined) {
    fields.push("weekly_menu_id = ?");
    params.push(payload.weekly_menu_id ?? null);
  }

  if (payload.label !== undefined) {
    fields.push("label = ?");
    params.push(payload.label);
  }

  if (payload.lunch_content !== undefined) {
    fields.push("lunch_content = ?");
    params.push(
      payload.lunch_content ? JSON.stringify(payload.lunch_content) : null
    );
  }

  if (payload.dinner_content !== undefined) {
    fields.push("dinner_content = ?");
    params.push(
      payload.dinner_content ? JSON.stringify(payload.dinner_content) : null
    );
  }

  if (payload.is_published !== undefined) {
    fields.push("is_published = ?");
    params.push(payload.is_published);
  }

  if (payload.is_closed !== undefined) {
    fields.push("is_closed = ?");
    params.push(payload.is_closed);
  }

  if (payload.reason !== undefined) {
    fields.push("reason = ?");
    params.push(payload.reason ?? null);
  }

  fields.push("updated_by_admin_id = ?");
  params.push(payload.updated_by_admin_id ?? null);

  if (fields.length === 0) {
    return getExceptionById(id);
  }

  const sql = `
    UPDATE menu_exceptions
    SET ${fields.join(", ")}
    WHERE id_menu_exception = ?
  `;

  params.push(id);

  const [result] = await connection.query(sql, params);

  if (result.affectedRows === 0) {
    return null;
  }

  return getExceptionById(id);
};

const deleteMenuException = async (connection, id) => {
  const sql = `
    DELETE FROM menu_exceptions
    WHERE id_menu_exception = ?
  `;

  const [result] = await connection.query(sql, [id]);
  return result.affectedRows > 0;
};

const getExceptionsByMonth = async (year, month) => {
  const sql = `
    SELECT
      id_menu_exception,
      menu_date,
      weekly_menu_id,
      label,
      lunch_content,
      dinner_content,
      is_published,
      is_closed,
      reason,
      created_by_admin_id,
      updated_by_admin_id,
      created_at,
      updated_at
    FROM menu_exceptions
    WHERE YEAR(menu_date) = ?
      AND MONTH(menu_date) = ?
    ORDER BY menu_date ASC
  `;

  const [rows] = await db.query(sql, [year, month]);
  return rows.map(mapMenuExceptionRow);
};

module.exports = {
  getExceptionByDate,
  getExceptionById,
  createMenuException,
  updateMenuException,
  deleteMenuException,
  getExceptionsByMonth,
};