'use strict';

const pool = require('../config/db');

/**
 * Modèle Réservation
 *
 * Hypothèses de schéma basées sur la conception projet :
 * - utilisateur(id_utilisateur, solde, ...)
 * - service_repas(id_service, type_repas, heure_debut, heure_fin)
 * - reservation(id_reservation, date_creation, date_repas, statut, date_validation, id_service, id_utilisateur)
 *
 * Si vos noms de tables/colonnes diffèrent légèrement dans le repo,
 * adaptez uniquement les requêtes SQL, pas l’API du modèle.
 */

const RESERVATION_STATUS = {
  RESERVED: 'RESERVEE',
  USED: 'UTILISEE',
  CANCELED: 'ANNULEE',
};

/**
 * Recherche une réservation existante pour empêcher les doublons
 * pour un même utilisateur, même service et même date.
 */
async function findExistingReservation(userId, serviceId, dateRepas) {
  const sql = `
    SELECT
      r.id_reservation,
      r.id_utilisateur,
      r.id_service,
      r.date_repas,
      r.statut,
      r.date_creation
    FROM reservation r
    WHERE r.id_utilisateur = ?
      AND r.id_service = ?
      AND r.date_repas = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [userId, serviceId, dateRepas]);
  return rows[0] || null;
}

/**
 * Récupère les infos d’un service repas.
 */
async function findServiceById(serviceId) {
  const sql = `
    SELECT
      s.id_service,
      s.type_repas,
      s.heure_debut,
      s.heure_fin
    FROM service_repas s
    WHERE s.id_service = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [serviceId]);
  return rows[0] || null;
}

/**
 * Récupère le solde d’un utilisateur.
 */
async function findUserBalanceById(userId) {
  const sql = `
    SELECT
      u.id_utilisateur,
      u.solde
    FROM utilisateur u
    WHERE u.id_utilisateur = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [userId]);
  return rows[0] || null;
}

/**
 * Variante utile pour transaction :
 * verrouille la ligne utilisateur pendant la transaction.
 */
async function findUserBalanceByIdForUpdate(connection, userId) {
  const sql = `
    SELECT
      u.id_utilisateur,
      u.solde
    FROM utilisateur u
    WHERE u.id_utilisateur = ?
    LIMIT 1
    FOR UPDATE
  `;

  const [rows] = await connection.execute(sql, [userId]);
  return rows[0] || null;
}

/**
 * Variante utile pour transaction :
 * vérifie l’existence du doublon pendant la transaction.
 */
async function findExistingReservationForUpdate(connection, userId, serviceId, dateRepas) {
  const sql = `
    SELECT
      r.id_reservation,
      r.id_utilisateur,
      r.id_service,
      r.date_repas,
      r.statut,
      r.date_creation
    FROM reservation r
    WHERE r.id_utilisateur = ?
      AND r.id_service = ?
      AND r.date_repas = ?
    LIMIT 1
    FOR UPDATE
  `;

  const [rows] = await connection.execute(sql, [userId, serviceId, dateRepas]);
  return rows[0] || null;
}

/**
 * Crée une réservation dans une transaction déjà ouverte.
 * payload attendu :
 * {
 *   userId: number,
 *   serviceId: number,
 *   dateRepas: 'YYYY-MM-DD',
 *   statut?: 'RESERVEE'
 * }
 */
async function createReservation(connection, payload) {
  const {
    userId,
    serviceId,
    dateRepas,
    statut = RESERVATION_STATUS.RESERVED,
  } = payload;

  const sql = `
    INSERT INTO reservation (
      date_creation,
      date_repas,
      statut,
      date_validation,
      id_service,
      id_utilisateur
    )
    VALUES (
      NOW(),
      ?,
      ?,
      NULL,
      ?,
      ?
    )
  `;

  const [result] = await connection.execute(sql, [
    dateRepas,
    statut,
    serviceId,
    userId,
  ]);

  return {
    id_reservation: result.insertId,
    date_repas: dateRepas,
    statut,
    id_service: serviceId,
    id_utilisateur: userId,
  };
}

/**
 * Décrémente le solde de l’utilisateur dans une transaction déjà ouverte.
 */
async function decrementUserBalance(connection, userId, amount) {
  const sql = `
    UPDATE utilisateur
    SET solde = solde - ?
    WHERE id_utilisateur = ?
      AND solde >= ?
  `;

  const [result] = await connection.execute(sql, [amount, userId, amount]);

  return {
    affectedRows: result.affectedRows,
  };
}

/**
 * Historique des réservations de l’utilisateur.
 */
async function getUserReservations(userId) {
  const sql = `
    SELECT
      r.id_reservation,
      r.date_creation,
      r.date_repas,
      r.statut,
      r.date_validation,
      s.id_service,
      s.type_repas,
      s.heure_debut,
      s.heure_fin
    FROM reservation r
    INNER JOIN service_repas s
      ON s.id_service = r.id_service
    WHERE r.id_utilisateur = ?
    ORDER BY
      r.date_repas DESC,
      s.heure_debut DESC,
      r.date_creation DESC
  `;

  const [rows] = await pool.execute(sql, [userId]);
  return rows;
}

/**
 * Récupère une réservation précise appartenant à un utilisateur.
 * Sert à l’annulation et aux contrôles de propriété.
 */
async function findReservationByIdForUser(userId, reservationId) {
  const sql = `
    SELECT
      r.id_reservation,
      r.id_utilisateur,
      r.id_service,
      r.date_creation,
      r.date_repas,
      r.statut,
      r.date_validation,
      s.type_repas,
      s.heure_debut,
      s.heure_fin
    FROM reservation r
    INNER JOIN service_repas s
      ON s.id_service = r.id_service
    WHERE r.id_utilisateur = ?
      AND r.id_reservation = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [userId, reservationId]);
  return rows[0] || null;
}

/**
 * Variante transactionnelle utile pour annulation.
 */
async function findReservationByIdForUserForUpdate(connection, userId, reservationId) {
  const sql = `
    SELECT
      r.id_reservation,
      r.id_utilisateur,
      r.id_service,
      r.date_creation,
      r.date_repas,
      r.statut,
      r.date_validation,
      s.type_repas,
      s.heure_debut,
      s.heure_fin
    FROM reservation r
    INNER JOIN service_repas s
      ON s.id_service = r.id_service
    WHERE r.id_utilisateur = ?
      AND r.id_reservation = ?
    LIMIT 1
    FOR UPDATE
  `;

  const [rows] = await connection.execute(sql, [userId, reservationId]);
  return rows[0] || null;
}

/**
 * Passe une réservation au statut ANNULEE dans une transaction déjà ouverte.
 */
async function cancelReservation(connection, reservationId) {
  const sql = `
    UPDATE reservation
    SET statut = ?
    WHERE id_reservation = ?
  `;

  const [result] = await connection.execute(sql, [
    RESERVATION_STATUS.CANCELED,
    reservationId,
  ]);

  return {
    affectedRows: result.affectedRows,
  };
}

/**
 * Expose une connexion transactionnelle au service si besoin.
 */
async function getConnection() {
  return pool.getConnection();
}

module.exports = {
  RESERVATION_STATUS,
  getConnection,

  findExistingReservation,
  findExistingReservationForUpdate,

  findServiceById,

  findUserBalanceById,
  findUserBalanceByIdForUpdate,

  createReservation,
  decrementUserBalance,

  getUserReservations,

  findReservationByIdForUser,
  findReservationByIdForUserForUpdate,

  cancelReservation,
};