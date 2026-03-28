'use strict';

const reservationModel = require('../models/reservationModel');

/**
 * Petit helper d'erreur métier.
 * Si vous avez déjà un AppError dans src/utils/AppError.js,
 * remplace cette classe par un require('../utils/AppError').
 */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

const DEFAULT_MEAL_PRICE = Number(process.env.DEFAULT_MEAL_PRICE || 20);
const APP_TIMEZONE = process.env.APP_TIMEZONE || 'Africa/Casablanca';

function toDateOnly(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getTodayDateOnly() {
  return toDateOnly(new Date());
}

function addDays(dateStr, daysToAdd) {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + daysToAdd);
  return toDateOnly(date);
}

function combineDateAndTime(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}`);
}

function now() {
  return new Date();
}

function isPastDate(dateRepas) {
  const today = getTodayDateOnly();
  return dateRepas < today;
}

function isBeyondThirtyDays(dateRepas) {
  const maxDate = addDays(getTodayDateOnly(), 30);
  return dateRepas > maxDate;
}

function isSameDay(dateRepas) {
  return dateRepas === getTodayDateOnly();
}

function getReservationClosingDateTime(dateRepas, heureDebut) {
  const serviceDateTime = combineDateAndTime(dateRepas, heureDebut);
  serviceDateTime.setHours(serviceDateTime.getHours() - 12);
  return serviceDateTime;
}

function getCancellationClosingDateTime(dateRepas, heureDebut) {
  const serviceDateTime = combineDateAndTime(dateRepas, heureDebut);
  serviceDateTime.setHours(serviceDateTime.getHours() - 4);
  return serviceDateTime;
}

function assertServiceExists(service) {
  if (!service) {
    throw new AppError('Service introuvable.', 404);
  }
}

function assertNoDuplicateReservation(existingReservation) {
  if (existingReservation) {
    throw new AppError(
      'Une réservation existe déjà pour cette date et ce service.',
      409
    );
  }
}

function assertSufficientBalance(user, mealPrice = DEFAULT_MEAL_PRICE) {
  if (!user) {
    throw new AppError('Utilisateur introuvable.', 404);
  }

  if (Number(user.solde) < Number(mealPrice)) {
    throw new AppError('Solde insuffisant pour effectuer la réservation.', 400);
  }
}

function assertReservationWindow(dateRepas) {
  if (isPastDate(dateRepas)) {
    throw new AppError('La date de réservation ne peut pas être passée.', 400);
  }

  if (isBeyondThirtyDays(dateRepas)) {
    throw new AppError('La réservation est autorisée uniquement entre J et J+30.', 400);
  }
}

function assertSameDayClosingRule(dateRepas, heureDebut) {
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
}

function assertReservationCancelable(reservation) {
  if (!reservation) {
    throw new AppError('Réservation introuvable.', 404);
  }

  if (reservation.statut === reservationModel.RESERVATION_STATUS.USED) {
    throw new AppError('Cette réservation a déjà été utilisée et ne peut pas être annulée.', 400);
  }

  if (reservation.statut === reservationModel.RESERVATION_STATUS.CANCELED) {
    throw new AppError('Cette réservation est déjà annulée.', 400);
  }

  const cancellationLimit = getCancellationClosingDateTime(
    reservation.date_repas,
    reservation.heure_debut
  );

  if (now() > cancellationLimit) {
    throw new AppError(
      'L’annulation est impossible moins de 4 heures avant le début du service.',
      400
    );
  }
}

/**
 * Crée une réservation avec transaction :
 * 1. vérifier service
 * 2. vérifier fenêtre J..J+30
 * 3. vérifier clôture H-12 pour le jour même
 * 4. verrouiller solde utilisateur
 * 5. vérifier solde
 * 6. vérifier doublon
 * 7. insérer réservation
 * 8. décrémenter solde
 * 9. commit / rollback
 */
async function createReservation({ userId, dateRepas, serviceId }) {
  const normalizedDateRepas = toDateOnly(dateRepas);

  if (!normalizedDateRepas) {
    throw new AppError('Date de repas invalide.', 400);
  }

  const service = await reservationModel.findServiceById(serviceId);
  assertServiceExists(service);

  assertReservationWindow(normalizedDateRepas);
  assertSameDayClosingRule(normalizedDateRepas, service.heure_debut);

  const connection = await reservationModel.getConnection();

  try {
    await connection.beginTransaction();

    const lockedUser = await reservationModel.findUserBalanceByIdForUpdate(
      connection,
      userId
    );
    assertSufficientBalance(lockedUser);

    const existingReservation =
      await reservationModel.findExistingReservationForUpdate(
        connection,
        userId,
        serviceId,
        normalizedDateRepas
      );

    assertNoDuplicateReservation(existingReservation);

    const createdReservation = await reservationModel.createReservation(
      connection,
      {
        userId,
        serviceId,
        dateRepas: normalizedDateRepas,
        statut: reservationModel.RESERVATION_STATUS.RESERVED,
      }
    );

    const balanceUpdate = await reservationModel.decrementUserBalance(
      connection,
      userId,
      DEFAULT_MEAL_PRICE
    );

    if (balanceUpdate.affectedRows !== 1) {
      throw new AppError('Impossible de mettre à jour le solde utilisateur.', 500);
    }

    await connection.commit();

    const updatedUser = await reservationModel.findUserBalanceById(userId);

    return {
      reservation: {
        ...createdReservation,
        type_repas: service.type_repas,
        heure_debut: service.heure_debut,
        heure_fin: service.heure_fin,
      },
      balance: updatedUser ? updatedUser.solde : null,
      mealPrice: DEFAULT_MEAL_PRICE,
      timezone: APP_TIMEZONE,
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
}

/**
 * Retourne l’historique des réservations de l’utilisateur.
 */
async function getMyReservations(userId) {
  const reservations = await reservationModel.getUserReservations(userId);

  return {
    items: reservations,
    count: reservations.length,
  };
}

/**
 * Annule une réservation si :
 * - elle existe
 * - elle appartient à l’utilisateur
 * - elle n’est ni utilisée ni déjà annulée
 * - le délai H-4 est respecté
 *
 * Par défaut ici : pas de remboursement.
 * Si votre équipe décide de rembourser, ce sera à ajouter ici.
 */
async function cancelMyReservation({ userId, reservationId }) {
  const connection = await reservationModel.getConnection();

  try {
    await connection.beginTransaction();

    const reservation =
      await reservationModel.findReservationByIdForUserForUpdate(
        connection,
        userId,
        reservationId
      );

    assertReservationCancelable(reservation);

    const result = await reservationModel.cancelReservation(
      connection,
      reservationId
    );

    if (result.affectedRows !== 1) {
      throw new AppError('Impossible d’annuler la réservation.', 500);
    }

    await connection.commit();

    return {
      id_reservation: Number(reservationId),
      statut: reservationModel.RESERVATION_STATUS.CANCELED,
      refunded: false,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  createReservation,
  getMyReservations,
  cancelMyReservation,
  AppError,
};