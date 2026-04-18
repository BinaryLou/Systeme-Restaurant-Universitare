const AppError = require("../utils/AppError");
const { isStrictDateFormat, isValidDate, parseLocalDate } = require("../utils/dateValidation");

const reservationValidation = (req, res, next) => {
  try {
    const { date_repas, id_service } = req.body;

    if (!date_repas) {
      return next(new AppError("date_repas est obligatoire", 400));
    }

    if (id_service === undefined || id_service === null) {
      return next(new AppError("id_service est obligatoire", 400));
    }

    if (!isStrictDateFormat(date_repas)) {
      return next(new AppError("date_repas doit être au format YYYY-MM-DD", 400));
    }

    if (!isValidDate(date_repas)) {
      return next(new AppError("date_repas est invalide", 400));
    }

    const cleanedDate = date_repas.trim();
    const reservationDate = parseLocalDate(cleanedDate);

    if (!reservationDate) {
      return next(new AppError("date_repas est invalide", 400));
    }

    const cleanedServiceId = Number(id_service);

    if (!Number.isInteger(cleanedServiceId) || cleanedServiceId <= 0) {
      return next(new AppError("id_service doit être un entier positif", 400));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);

    if (reservationDate < today) {
      return next(new AppError("date_repas ne peut pas être dans le passé", 400));
    }

    if (reservationDate > maxDate) {
      return next(
        new AppError("date_repas doit être comprise entre aujourd'hui et J+30", 400)
      );
    }

    req.body.date_repas = cleanedDate;
    req.body.id_service = cleanedServiceId;

    return next();
  } catch (error) {
    return next(new AppError("Payload réservation invalide", 400));
  }
};

module.exports = reservationValidation;