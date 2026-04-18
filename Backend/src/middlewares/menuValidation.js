const AppError = require("../utils/AppError");
const {isValidDate } = require("../utils/dateValidation");

const isPlainObject = (value) => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

const isValidBoolean = (value) => {
  return typeof value === "boolean";
};


const hasContent = (content) => content !== null && content !== undefined;

const validateMenuContent = (content) => {
  return content === null || content === undefined || isPlainObject(content);
};

const validateClosedAndContentConsistency = ({
  isClosed,
  lunchContent,
  dinnerContent,
}) => {
  const hasLunch = hasContent(lunchContent);
  const hasDinner = hasContent(dinnerContent);

  if (isClosed === true) {
    // fermé => aucun contenu autorisé
    return !hasLunch && !hasDinner;
  }

  // ouvert => au moins un contenu obligatoire
  return hasLunch || hasDinner;
};



const validateWeeklyMenuPayload = (req, res, next) => {
  try {
    const day_of_week = Number(req.params.dayOfWeek);

    const {
      label,
      lunch_content,
      dinner_content,
      is_published,
      is_closed,
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
          "Si is_closed est false, il faut au moins lunch_content ou dinner_content. Si is_closed est true, aucun contenu n'est autorisé.",
          400
        )
      );
    }

    return next();
  } catch (error) {
    return next(error);
  }
};



const validateMenuExceptionCreatePayload = (req, res, next) => {
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
    } = req.body || {};

    if (!isValidDate(menu_date)) {
      return next(
        new AppError("menu_date doit être une date valide au format YYYY-MM-DD", 400)
      );
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
          "Si is_closed est false, il faut au moins lunch_content ou dinner_content. Si is_closed est true, aucun contenu n'est autorisé.",
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

    return next();
  } catch (error) {
    return next(error);
  }
};



const validateMenuExceptionUpdatePayload = (req, res, next) => {
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
    } = req.body || {};

    if (menu_date !== undefined && !isValidDate(menu_date)) {
      return next(
        new AppError("menu_date doit être une date valide au format YYYY-MM-DD", 400)
      );
    }

    if (
      weekly_menu_id !== undefined &&
      weekly_menu_id !== null &&
      (!Number.isInteger(weekly_menu_id) || weekly_menu_id <= 0)
    ) {
      return next(new AppError("weekly_menu_id doit être un entier positif", 400));
    }

    if (label !== undefined && (typeof label !== "string" || !label.trim())) {
      return next(new AppError("label doit être une chaîne non vide", 400));
    }

    if (lunch_content !== undefined && !validateMenuContent(lunch_content)) {
      return next(new AppError("lunch_content doit être un objet JSON ou null", 400));
    }

    if (dinner_content !== undefined && !validateMenuContent(dinner_content)) {
      return next(new AppError("dinner_content doit être un objet JSON ou null", 400));
    }

    if (is_published !== undefined && !isValidBoolean(is_published)) {
      return next(new AppError("is_published doit être un booléen", 400));
    }

    if (is_closed !== undefined && !isValidBoolean(is_closed)) {
      return next(new AppError("is_closed doit être un booléen", 400));
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

    // Vérification cohérence seulement si on modifie is_closed
    if (is_closed !== undefined) {
      if (
        !validateClosedAndContentConsistency({
          isClosed: is_closed,
          lunchContent: lunch_content,
          dinnerContent: dinner_content,
        })
      ) {
        return next(
          new AppError(
            "Si is_closed est false, il faut au moins lunch_content ou dinner_content. Si is_closed est true, aucun contenu n'est autorisé.",
            400
          )
        );
      }
    }

    return next();
  } catch (error) {
    return next(error);
  }
};


module.exports = {
  validateWeeklyMenuPayload,
  validateMenuExceptionCreatePayload,
  validateMenuExceptionUpdatePayload,
};