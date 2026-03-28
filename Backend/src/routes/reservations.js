const express = require('express');
const verifyJwt = require('../middlewares/verifyJwt');
const reservationValidation = require('../middlewares/reservationValidation');
const reservationController = require('../controllers/reservationController');

const router = express.Router();

router.use(verifyJwt);

router.get('/', reservationController.getMyReservations);

router.post(
  '/',
  reservationValidation,
  reservationController.createReservation
);

router.patch('/:id/cancel', reservationController.cancelMyReservation);

module.exports = router;