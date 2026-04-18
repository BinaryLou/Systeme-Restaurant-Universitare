const reservationService = require('../services/reservationService');
const { sendSuccess } = require('../utils/apiResponse');
const { getRequestUserId } = require('../utils/requestUser');

const createReservation = async (req, res, next) => {
  try {
    const data = await reservationService.createReservation({
      userId: getRequestUserId(req),
      dateRepas: req.body.date_repas,
      serviceId: req.body.id_service,
    });

    return sendSuccess(
      res,
      data,
      'Réservation créée avec succès.',
      201
    );
  } catch (error) {
    next(error);
  }
};

const getMyReservations = async (req, res, next) => {
  try {
    const data = await reservationService.getMyReservations(
      getRequestUserId(req)
    );

    return sendSuccess(
      res,
      data,
      'Historique des réservations récupéré avec succès.',
      200
    );
  } catch (error) {
    next(error);
  }
};

const cancelMyReservation = async (req, res, next) => {
  try {
    const data = await reservationService.cancelMyReservation({
      userId: getRequestUserId(req),
      reservationId: req.params.id,
    });

    return sendSuccess(
      res,
      data,
      'Réservation annulée avec succès.',
      200
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  cancelMyReservation,
};