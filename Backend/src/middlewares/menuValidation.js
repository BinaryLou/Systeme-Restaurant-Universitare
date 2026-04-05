const AppError = require("../utils/AppError");

const isPlainObject = (value) => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

const isValidBoolean = (value) => {
  return typeof value === "boolean";
};

const isValidDateString = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
};

const validateMenuContent = (content) => {
  return content === null || content === undefined || isPlainObject(content);
};

const validateClosedAndContentConsistency = ({
  isClosed,
  lunchContent,
  dinnerContent,
}) => {
  if (isClosed) {
    return true;
  }

  return lunchContent !== null && lunchContent !== undefined
    || dinnerContent !== null && dinnerContent !== undefined;
};

const validateWeeklyMenuPayload = (req, res, next) => {
  try {
    const {
      day_of_week,
      label,
      lunch_content,
      dinner_content,
      is_published,
      is_closed,
      created_by_admin_id,
      updated_by_admin_id,
    } = req.body || {};

    if (!Number.isInteger(day_of_week) || day_of_week < 1 || day_of_week > 7) {
      return next(new AppError("day_of_week doit être un entier entre 1 et 7", 400));
    }

    if (typeof label !== "string" || !label.trim()) {
      return next(new AppError("Le champ label est obligatoire", 400));
    }

    if (!validateMenuContent(lunch_content)) {
      return next(new AppError("lunch_content doit être un objet JSON ou null", 400));
    }

    if (!validateMenuContent(dinner_content)) {
      return next(new AppError("dinner_content doit être un objet JSON ou null", 400));
    }

    if (!isValidBoolean(is_published)) {
      return next(new AppError("is_published doit être un booléen", 400));
    }

    if (!isValidBoolean(is_closed)) {
      return next(new AppError("is_closed doit être un booléen", 400));
    }

    if (
      !validateClosedAndContentConsistency({
        isClosed: is_closed,
        lunchContent: lunch_content,
        dinnerContent: dinner_content,
      })
    ) {
      return next(
        new AppError(
          "Un menu non fermé doit contenir au moins lunch_content ou dinner_content",
          400
        )
      );
    }

    if (
      created_by_admin_id !== undefined &&
      (!Number.isInteger(created_by_admin_id) || created_by_admin_id <= 0)
    ) {
      return next(new AppError("created_by_admin_id doit être un entier positif", 400));
    }

    if (
      updated_by_admin_id !== undefined &&
      updated_by_admin_id !== null &&
      (!Number.isInteger(updated_by_admin_id) || updated_by_admin_id <= 0)
    ) {
      return next(new AppError("updated_by_admin_id doit être un entier positif", 400));
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

const validateMenuExceptionPayload = (req, res, next) => {
  try {
    const {
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
    } = req.body || {};

    if (!isValidDateString(menu_date)) {
      return next(new AppError("menu_date doit être une date valide au format YYYY-MM-DD", 400));
    }

    if (
      weekly_menu_id !== undefined &&
      weekly_menu_id !== null &&
      (!Number.isInteger(weekly_menu_id) || weekly_menu_id <= 0)
    ) {
      return next(new AppError("weekly_menu_id doit être un entier positif", 400));
    }

    if (typeof label !== "string" || !label.trim()) {
      return next(new AppError("Le champ label est obligatoire", 400));
    }

    if (!validateMenuContent(lunch_content)) {
      return next(new AppError("lunch_content doit être un objet JSON ou null", 400));
    }

    if (!validateMenuContent(dinner_content)) {
      return next(new AppError("dinner_content doit être un objet JSON ou null", 400));
    }

    if (!isValidBoolean(is_published)) {
      return next(new AppError("is_published doit être un booléen", 400));
    }

    if (!isValidBoolean(is_closed)) {
      return next(new AppError("is_closed doit être un booléen", 400));
    }

    if (
      !validateClosedAndContentConsistency({
        isClosed: is_closed,
        lunchContent: lunch_content,
        dinnerContent: dinner_content,
      })
    ) {
      return next(
        new AppError(
          "Une exception non fermée doit contenir au moins lunch_content ou dinner_content",
          400
        )
      );
    }

    if (
      reason !== undefined &&
      reason !== null &&
      (typeof reason !== "string" || reason.length > 255)
    ) {
      return next(
        new AppError("reason doit être une chaîne de caractères de 255 caractères maximum", 400)
      );
    }

    if (
      created_by_admin_id !== undefined &&
      (!Number.isInteger(created_by_admin_id) || created_by_admin_id <= 0)
    ) {
      return next(new AppError("created_by_admin_id doit être un entier positif", 400));
    }

    if (
      updated_by_admin_id !== undefined &&
      updated_by_admin_id !== null &&
      (!Number.isInteger(updated_by_admin_id) || updated_by_admin_id <= 0)
    ) {
      return next(new AppError("updated_by_admin_id doit être un entier positif", 400));
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  validateWeeklyMenuPayload,
  validateMenuExceptionPayload,
};