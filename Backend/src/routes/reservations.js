const express = require('express');
const verifyJwt = require('../middlewares/verifyJwt');
const reservationValidation = require('../middlewares/reservationValidation');
const reservationController = require('../controllers/reservationController');
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

router.use(verifyJwt);

router.get('/', requireRole("USER"), reservationController.getMyReservations);

router.post(
  '/',
  requireRole("USER"),
  reservationValidation,
  reservationController.createReservation
);

router.patch('/:id/cancel', requireRole("USER"), reservationController.cancelMyReservation);

module.exports = router;