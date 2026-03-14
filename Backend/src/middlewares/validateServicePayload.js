const AppError = require("../utils/AppError");

const ALLOWED_MEAL_TYPES = ["DEJEUNER", "DINER"];

// Format strict HH:MM avec 00-23 et 00-59
function isValidTimeFormat(value) {
  if (typeof value !== "string") return false;
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value.trim());
}

// Convertit HH:MM -> minutes depuis minuit
function timeToMinutes(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function validateServicePayload(req, res, next) {
  try {
    const { type_repas, heure_debut, heure_fin } = req.body;

    if (!type_repas) {
      return next(new AppError("type_repas is required", 400));
    }

    if (!ALLOWED_MEAL_TYPES.includes(type_repas)) {
      return next(
        new AppError("type_repas must be DEJEUNER or DINER", 400)
      );
    }

    if (!heure_debut) {
      return next(new AppError("heure_debut is required", 400));
    }

    if (!heure_fin) {
      return next(new AppError("heure_fin is required", 400));
    }

    if (!isValidTimeFormat(heure_debut)) {
      return next(
        new AppError("heure_debut must use HH:MM format", 400)
      );
    }

    if (!isValidTimeFormat(heure_fin)) {
      return next(
        new AppError("heure_fin must use HH:MM format", 400)
      );
    }

    const startMinutes = timeToMinutes(heure_debut);
    const endMinutes = timeToMinutes(heure_fin);

    if (startMinutes >= endMinutes) {
      return next(
        new AppError("heure_debut must be earlier than heure_fin", 400)
      );
    }

    // Nettoyage leger pour eviter les espaces parasites
    req.body.type_repas = type_repas.trim();
    req.body.heure_debut = heure_debut.trim();
    req.body.heure_fin = heure_fin.trim();

    return next();
  } catch (error) {
    return next(new AppError("Invalid service payload", 400));
  }
}

module.exports = validateServicePayload;