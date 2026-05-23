const userModel = require('../models/userModel');
const reservationModel = require('../models/reservationModel');
const AppError = require('../utils/AppError');

const APP_TIMEZONE = process.env.APP_TIMEZONE || 'Africa/Casablanca';

const getNowInTimezone = (timezone = APP_TIMEZONE) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const map = {};

  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = part.value;
    }
  }

  return {
    dateOnly: `${map.year}-${map.month}-${map.day}`,
    timeOnly: `${map.hour}:${map.minute}:${map.second}`,
  };
};

const validateQrCodeInput = (qrCode) => {
  if (typeof qrCode !== 'string' || !qrCode.trim()) {
    throw new AppError('QR code requis.', 400);
  }

  return qrCode.trim();
};

const processScanQrCode = async ({ qrCode }) => {
  const normalizedQrCode = validateQrCodeInput(qrCode);

  const user = await userModel.findUserByQrCode(normalizedQrCode);

  if (!user) {
    throw new AppError('QR code invalide.', 404);
  }

  const { dateOnly, timeOnly } = getNowInTimezone();

  const currentService = await reservationModel.findCurrentServiceByTime(timeOnly);

  const userData = {
    id_utilisateur: user.id_utilisateur,
    apogee: user.apogee,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
  };

  if (!currentService) {
    const error = new AppError('Aucun service actif pour le moment.', 400);
    error.data = { user: userData };
    throw error;
  }

  const connection = await reservationModel.getConnection();

  try {
    await connection.beginTransaction();

    const reservation =
      await reservationModel.findTodayReservationByUserAndServiceForUpdate(
        connection,
        user.id_utilisateur,
        currentService.id_service,
        dateOnly
      );

    if (!reservation) {
      const error = new AppError('Aucune réservation valide trouvée pour aujourd’hui.', 404);
      error.data = { user: userData };
      throw error;
    }

    if (reservation.statut === reservationModel.RESERVATION_STATUS.USED) {
      const error = new AppError('Ticket déjà utilisé.', 409);
      error.data = { user: userData };
      throw error;
    }

    if (reservation.statut === reservationModel.RESERVATION_STATUS.CANCELED) {
      const error = new AppError('Cette réservation est annulée.', 400);
      error.data = { user: userData };
      throw error;
    }

    if (reservation.statut !== reservationModel.RESERVATION_STATUS.RESERVED) {
      const error = new AppError('Statut de réservation invalide pour le scan.', 400);
      error.data = { user: userData };
      throw error;
    }

    const updateResult =
      await reservationModel.markReservationAsUsedWithConnection(
        connection,
        reservation.id_reservation
      );

    if (!updateResult || updateResult.affectedRows !== 1) {
      throw new AppError('Impossible de valider le ticket.', 500);
    }

    await connection.commit();

    return {
      user: {
        id_utilisateur: user.id_utilisateur,
        apogee: user.apogee,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
      },
      service: {
        id_service: currentService.id_service,
        type_repas: currentService.type_repas,
        heure_debut: currentService.heure_debut,
        heure_fin: currentService.heure_fin,
      },
      reservation: {
        id_reservation: reservation.id_reservation,
        date_repas: reservation.date_repas,
        statut_avant_validation: reservation.statut,
        statut: reservationModel.RESERVATION_STATUS.USED,
        date_validation: new Date().toISOString(),
      },
      scan_context: {
        scanned_at_date: dateOnly,
        scanned_at_time: timeOnly,
        timezone: APP_TIMEZONE,
      },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  processScanQrCode,
};