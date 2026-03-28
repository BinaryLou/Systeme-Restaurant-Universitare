const reservationModel = require('../models/reservationModel');
const AppError = require('../utils/AppError');

const APP_TIMEZONE = process.env.APP_TIMEZONE || 'Africa/Casablanca';
const DEFAULT_MEAL_PRICE = Number(process.env.DEFAULT_MEAL_PRICE || 2);
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

const pad = (value) => String(value).padStart(2, '0');

const getTodayDateOnly = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const addDays = (dateStr, daysToAdd) => {
  const normalized = parseDateOnly(dateStr);
  if (!normalized) {
    return null;
  }

  const [year, month, day] = normalized.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + daysToAdd);

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const combineDateAndTime = (dateStr, timeStr) => {
  const normalizedDate = parseDateOnly(dateStr);
  const parsedTime = parseTimeOnly(timeStr);

  if (!normalizedDate || !parsedTime) {
    return null;
  }

  const [year, month, day] = normalizedDate.split('-').map(Number);

  return new Date(
    year,
    month - 1,
    day,
    parsedTime.hours,
    parsedTime.minutes,
    parsedTime.seconds,
    0
  );
};

const now = () => new Date();

const isPastDate = (dateRepas) => {
  return dateRepas < getTodayDateOnly();
};

const isBeyondThirtyDays = (dateRepas) => {
  const maxDate = addDays(getTodayDateOnly(), 30);
  return dateRepas > maxDate;
};

const isSameDay = (dateRepas) => {
  return dateRepas === getTodayDateOnly();
};

const getReservationClosingDateTime = (dateRepas, heureDebut) => {
  const serviceDateTime = combineDateAndTime(dateRepas, heureDebut);

  if (!serviceDateTime) {
    throw new AppError('Date ou heure de service invalide.', 500);
  }

  serviceDateTime.setHours(serviceDateTime.getHours() - 12);
  return serviceDateTime;
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

const assertReservationWindow = (dateRepas) => {
  if (isPastDate(dateRepas)) {
    throw new AppError('La date de réservation ne peut pas être passée.', 400);
  }

  if (isBeyondThirtyDays(dateRepas)) {
    throw new AppError('La réservation est autorisée uniquement entre J et J+30.', 400);
  }
};

const assertSameDayClosingRule = (dateRepas, heureDebut) => {
  if (!isSameDay(dateRepas)) {
    return;
  }

  const closingDateTime = getReservationClosingDateTime(dateRepas, heureDebut);

  if (now() > closingDateTime) {
    throw new AppError(
      'Les réservations du jour sont fermées 12 heures avant le début du service.',
      400
    );
  }
};

const assertNoDuplicateReservation = (existingReservation) => {
  if (existingReservation) {
    throw new AppError(
      'Une réservation existe déjà pour cette date et ce service.',
      409
    );
  }
};

const assertSufficientBalance = (user, mealPrice = DEFAULT_MEAL_PRICE) => {
  if (!user) {
    throw new AppError('Utilisateur introuvable.', 404);
  }

  if (Number(user.solde) < Number(mealPrice)) {
    throw new AppError('Solde insuffisant pour effectuer la réservation.', 400);
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

  assertReservationWindow(validatedInput.dateRepas);
  assertSameDayClosingRule(validatedInput.dateRepas, service.heure_debut);

  const existingReservation = await reservationModel.findExistingReservation(
    validatedInput.userId,
    validatedInput.serviceId,
    validatedInput.dateRepas
  );
  assertNoDuplicateReservation(existingReservation);

  const user = await reservationModel.findUserBalanceById(validatedInput.userId);
  assertSufficientBalance(user);

  return {
    canReserve: true,
    userId: validatedInput.userId,
    serviceId: validatedInput.serviceId,
    dateRepas: validatedInput.dateRepas,
    mealPrice: DEFAULT_MEAL_PRICE,
    timezone: APP_TIMEZONE,
    service: {
      id_service: service.id_service,
      type_repas: service.type_repas,
      heure_debut: service.heure_debut,
      heure_fin: service.heure_fin,
    },
  };
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