const reservationModel = require('../models/reservationModel');
const AppError = require('../utils/AppError');

const APP_TIMEZONE = process.env.APP_TIMEZONE || 'Africa/Casablanca';
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_ONLY_REGEX = /^\d{2}:\d{2}(:\d{2})?$/;

const isPositiveInteger = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
};

const parseDateOnly = (dateStr) => {
  if (typeof dateStr !== 'string' || !DATE_ONLY_REGEX.test(dateStr.trim())) {
    return null;
  }

  const cleaned = dateStr.trim();
  const [year, month, day] = cleaned.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return cleaned;
};

const parseTimeOnly = (timeStr) => {
  if (typeof timeStr !== 'string' || !TIME_ONLY_REGEX.test(timeStr.trim())) {
    return null;
  }

  const cleaned = timeStr.trim();
  const [hoursStr, minutesStr, secondsStr = '00'] = cleaned.split(':');

  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  const seconds = Number(secondsStr);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    !Number.isInteger(seconds) ||
    hours < 0 || hours > 23 ||
    minutes < 0 || minutes > 59 ||
    seconds < 0 || seconds > 59
  ) {
    return null;
  }

  return { hours, minutes, seconds };
};

const assertValidCreateInput = ({ userId, dateRepas, serviceId }) => {
  if (!isPositiveInteger(userId)) {
    throw new AppError('Identifiant utilisateur invalide.', 400);
  }

  if (!isPositiveInteger(serviceId)) {
    throw new AppError('Identifiant service invalide.', 400);
  }

  const normalizedDateRepas = parseDateOnly(dateRepas);
  if (!normalizedDateRepas) {
    throw new AppError('Date de repas invalide.', 400);
  }

  return {
    userId: Number(userId),
    serviceId: Number(serviceId),
    dateRepas: normalizedDateRepas,
  };
};

const assertValidCancelInput = ({ userId, reservationId }) => {
  if (!isPositiveInteger(userId)) {
    throw new AppError('Identifiant utilisateur invalide.', 400);
  }

  if (!isPositiveInteger(reservationId)) {
    throw new AppError('Identifiant réservation invalide.', 400);
  }

  return {
    userId: Number(userId),
    reservationId: Number(reservationId),
  };
};

const assertServiceExists = (service) => {
  if (!service) {
    throw new AppError('Service introuvable.', 404);
  }

  if (!parseTimeOnly(service.heure_debut) || !parseTimeOnly(service.heure_fin)) {
    throw new AppError('Horaires de service invalides.', 500);
  }
};

const createReservation = async ({ userId, dateRepas, serviceId }) => {
  const validatedInput = assertValidCreateInput({
    userId,
    dateRepas,
    serviceId,
  });

  const service = await reservationModel.findServiceById(validatedInput.serviceId);
  assertServiceExists(service);

  throw new AppError(
    'createReservation est prêt côté service layer, mais doit être complété par S3-04 et S3-05.',
    501
  );
};

const getMyReservations = async (userId) => {
  if (!isPositiveInteger(userId)) {
    throw new AppError('Identifiant utilisateur invalide.', 400);
  }

  const reservations = await reservationModel.getUserReservations(Number(userId));

  return {
    items: reservations,
    count: reservations.length,
    timezone: APP_TIMEZONE,
  };
};

const cancelMyReservation = async ({ userId, reservationId }) => {
  const validatedInput = assertValidCancelInput({
    userId,
    reservationId,
  });

  const reservation = await reservationModel.findReservationByIdForUser(
    validatedInput.userId,
    validatedInput.reservationId
  );

  if (!reservation) {
    throw new AppError('Réservation introuvable.', 404);
  }

  throw new AppError(
    'cancelMyReservation est prêt côté service layer, mais doit être complété par S3-09.',
    501
  );
};

module.exports = {
  createReservation,
  getMyReservations,
  cancelMyReservation,
};