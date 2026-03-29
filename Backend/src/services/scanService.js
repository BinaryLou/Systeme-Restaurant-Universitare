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

  if (!currentService) {
    throw new AppError('Aucun service actif pour le moment.', 400);
  }

  const reservation = await reservationModel.findTodayReservationByUserAndService(
    user.id_utilisateur,
    currentService.id_service,
    dateOnly
  );

  if (!reservation) {
    throw new AppError('Aucune réservation valide trouvée pour aujourd’hui.', 404);
  }

  if (reservation.statut === reservationModel.RESERVATION_STATUS.USED) {
    throw new AppError('Ticket déjà utilisé.', 409);
  }

  if (reservation.statut === reservationModel.RESERVATION_STATUS.CANCELED) {
    throw new AppError('Cette réservation est annulée.', 400);
  }

  if (reservation.statut !== reservationModel.RESERVATION_STATUS.RESERVED) {
    throw new AppError('Statut de réservation invalide pour le scan.', 400);
  }

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
      statut: reservation.statut,
      date_validation: reservation.date_validation,
    },
    scan_context: {
      scanned_at_date: dateOnly,
      scanned_at_time: timeOnly,
      timezone: APP_TIMEZONE,
    },
  };
};

module.exports = {
  processScanQrCode,
};