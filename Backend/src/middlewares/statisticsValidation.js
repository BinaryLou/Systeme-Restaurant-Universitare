const AppError = require("../utils/AppError");

const isStrictDateFormat = (value) => {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
};

const isValidDate = (value) => {
  if (!isStrictDateFormat(value)) {
    return false;
  }

  const [yearStr, monthStr, dayStr] = value.trim().split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  const parsedDate = new Date(year, month - 1, day);

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() + 1 === month &&
    parsedDate.getDate() === day
  );
};

const isValidYear = (value) => {
  if (typeof value !== "string" || !/^\d{4}$/.test(value.trim())) {
    return false;
  }

  const parsedYear = Number(value.trim());
  return parsedYear >= 2000 && parsedYear <= 2100;
};

const validateStatisticsFilters = (req, res, next) => {
  try {
    const { period, date, startDate, endDate, month, year, format } = req.query;

    if (!period) {
      return next(new AppError("Le paramètre period est obligatoire", 400));
    }

    if (!["day", "week", "month"].includes(period)) {
      return next(new AppError("period doit être day, week ou month", 400));
    }

    if (format && !["pdf", "excel"].includes(format)) {
      return next(new AppError("format doit être pdf ou excel", 400));
    }

    switch (period) {
      case "day":
        if (!date) {
          return next(new AppError("Le paramètre date est obligatoire pour period=day", 400));
        }

        if (!isStrictDateFormat(date)) {
          return next(new AppError("date doit être au format YYYY-MM-DD", 400));
        }

        if (!isValidDate(date)) {
          return next(new AppError("date est invalide", 400));
        }
        break;

      case "week":
        if (!startDate) {
          return next(
            new AppError("Le paramètre startDate est obligatoire pour period=week", 400)
          );
        }

        if (!endDate) {
          return next(
            new AppError("Le paramètre endDate est obligatoire pour period=week", 400)
          );
        }

        if (!isStrictDateFormat(startDate)) {
          return next(new AppError("startDate doit être au format YYYY-MM-DD", 400));
        }

        if (!isValidDate(startDate)) {
          return next(new AppError("startDate est invalide", 400));
        }

        if (!isStrictDateFormat(endDate)) {
          return next(new AppError("endDate doit être au format YYYY-MM-DD", 400));
        }

        if (!isValidDate(endDate)) {
          return next(new AppError("endDate est invalide", 400));
        }

        if (startDate > endDate) {
          return next(new AppError("startDate doit être inférieure ou égale à endDate", 400));
        }
        break;

      case "month": {
        if (!month) {
          return next(new AppError("Le paramètre month est obligatoire pour period=month", 400));
        }

        if (!year) {
          return next(new AppError("Le paramètre year est obligatoire pour period=month", 400));
        }

        const parsedMonth = Number(month);

        if (!Number.isInteger(parsedMonth)) {
          return next(new AppError("month doit être un nombre entier", 400));
        }

        if (parsedMonth < 1 || parsedMonth > 12) {
          return next(new AppError("month doit être compris entre 1 et 12", 400));
        }

        if (!isValidYear(year)) {
          return next(new AppError("year doit être une année valide sur 4 chiffres", 400));
        }
        break;
      }

      default:
        break;
    }

    next();
  } catch (error) {
    return next(new AppError("Erreur interne pendant la validation des statistiques", 500));
  }
};

module.exports = validateStatisticsFilters;