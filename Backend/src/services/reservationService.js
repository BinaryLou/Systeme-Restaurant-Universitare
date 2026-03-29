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

const parseDateOnly = (dateValue) => {
  if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
    return `${dateValue.getFullYear()}-${pad(dateValue.getMonth() + 1)}-${pad(dateValue.getDate())}`;
  }

  if (typeof dateValue !== 'string' || !DATE_ONLY_REGEX.test(dateValue.trim())) {
    return null;
  }

  const cleaned = dateValue.trim();
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
  const current = new Date();
  return `${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}`;
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

  const connection = await reservationModel.getConnection();

  try {
    await connection.beginTransaction();

    const lockedUser = await reservationModel.findUserBalanceByIdForUpdate(
      connection,
      validatedInput.userId
    );
    assertSufficientBalance(lockedUser);

    const existingReservation = await reservationModel.findExistingReservationForUpdate(
      connection,
      validatedInput.userId,
      validatedInput.serviceId,
      validatedInput.dateRepas
    );
    assertNoDuplicateReservation(existingReservation);

    const createdReservation = await reservationModel.createReservation(connection, {
      userId: validatedInput.userId,
      serviceId: validatedInput.serviceId,
      dateRepas: validatedInput.dateRepas,
      statut: reservationModel.RESERVATION_STATUS.RESERVED,
    });

    const balanceUpdateResult = await reservationModel.decrementUserBalance(
      connection,
      validatedInput.userId,
      DEFAULT_MEAL_PRICE
    );

    if (!balanceUpdateResult || balanceUpdateResult.affectedRows !== 1) {
      throw new AppError('Impossible de mettre à jour le solde utilisateur.', 500);
    }

    await connection.commit();

    return {
      reservation: createdReservation,
      mealPrice: DEFAULT_MEAL_PRICE,
      remainingBalance: Number(lockedUser.solde) - Number(DEFAULT_MEAL_PRICE),
      timezone: APP_TIMEZONE,
      service: {
        id_service: service.id_service,
        type_repas: service.type_repas,
        heure_debut: service.heure_debut,
        heure_fin: service.heure_fin,
      },
    };
  } catch (error) {
    await connection.rollback();

    if (error && error.code === 'ER_DUP_ENTRY') {
      throw new AppError(
        'Une réservation existe déjà pour cette date et ce service.',
        409
      );
    }

    throw error;
  } finally {
    connection.release();
  }
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

const getCancellationDeadlineDateTime = (dateRepas, heureDebut) => {
  const serviceDateTime = combineDateAndTime(dateRepas, heureDebut);

  if (!serviceDateTime) {
    throw new AppError('Date ou heure de service invalide.', 500);
  }

  serviceDateTime.setHours(serviceDateTime.getHours() - 4);
  return serviceDateTime;
};

const assertReservationCancelable = (reservation) => {
  if (!reservation) {
    throw new AppError('Réservation introuvable.', 404);
  }

  if (reservation.statut === reservationModel.RESERVATION_STATUS.USED) {
    throw new AppError(
      'Impossible d’annuler une réservation déjà utilisée.',
      400
    );
  }

  if (reservation.statut === reservationModel.RESERVATION_STATUS.CANCELED) {
    throw new AppError(
      'Cette réservation est déjà annulée.',
      400
    );
  }
};

const assertCancellationDeadline = (reservation) => {
  const cancellationDeadline = getCancellationDeadlineDateTime(
    reservation.date_repas,
    reservation.heure_debut
  );

  if (now() > cancellationDeadline) {
    throw new AppError(
      'L’annulation est autorisée jusqu’à 4 heures avant le début du service.',
      400
    );
  }
};

const cancelMyReservation = async ({ userId, reservationId }) => {
  const validatedInput = assertValidCancelInput({
    userId,
    reservationId,
  });

  const connection = await reservationModel.getConnection();

  try {
    await connection.beginTransaction();

    const reservation = await reservationModel.findReservationByIdForUserForUpdate(
      connection,
      validatedInput.userId,
      validatedInput.reservationId
    );

    assertReservationCancelable(reservation);
    assertCancellationDeadline(reservation);

    const cancelResult = await reservationModel.cancelReservation(
      connection,
      validatedInput.reservationId
    );

    if (!cancelResult || cancelResult.affectedRows !== 1) {
      throw new AppError('Impossible d’annuler la réservation.', 500);
    }

    await connection.commit();

    return {
      reservation: {
        id_reservation: reservation.id_reservation,
        date_repas: reservation.date_repas,
        id_service: reservation.id_service,
        type_repas: reservation.type_repas,
        heure_debut: reservation.heure_debut,
        heure_fin: reservation.heure_fin,
        statut: reservationModel.RESERVATION_STATUS.CANCELED,
      },
      refunded: false,
      timezone: APP_TIMEZONE,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getCancellationDeadlineDateTime,
  cancelMyReservation,
};