const db = require("../config/db");

const PERIOD_TYPES = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
};

//Le rôle de buildPeriodWhereClause est de préparer automatiquement le filtre SQL correspondant à la période choisie :
const buildPeriodWhereClause = (periodType, filters = {}) => {
  const params = [];

  switch (periodType) {
    case PERIOD_TYPES.DAY: {
      if (!filters.date) {
        throw new Error("Missing required filter: date");
      }

      params.push(filters.date);

      return {
        sql: "DATE(r.date_repas) = ?",
        params,
      };
    }

    case PERIOD_TYPES.WEEK: {
      if (!filters.startDate || !filters.endDate) {
        throw new Error("Missing required filters: startDate and endDate");
      }

      params.push(filters.startDate, filters.endDate);

      return {
        sql: "DATE(r.date_repas) BETWEEN ? AND ?",
        params,
      };
    }

    case PERIOD_TYPES.MONTH: {
      if (!filters.year || !filters.month) {
        throw new Error("Missing required filters: year and month");
      }

      params.push(filters.year, filters.month);

      return {
        sql: "YEAR(r.date_repas) = ? AND MONTH(r.date_repas) = ?",
        params,
      };
    }

    default:
      throw new Error("Invalid period type");
  }
};


// lit la table Reservation et retourne un objet contenant les principaux indicateurs statistiques du dashboard :

const getDashboardSummary = async () => {
  const sql = `
    SELECT
      COUNT(*) AS total_reservations,
      SUM(CASE WHEN DATE(r.date_repas) = CURDATE() THEN 1 ELSE 0 END) AS reservations_today,
      SUM(
        CASE
          WHEN YEARWEEK(r.date_repas, 1) = YEARWEEK(CURDATE(), 1)
          THEN 1 ELSE 0
        END
      ) AS reservations_this_week,
      SUM(CASE WHEN r.statut = 'VALIDEE' THEN 1 ELSE 0 END) AS used_tickets,
      SUM(CASE WHEN r.statut = 'RESERVEE' THEN 1 ELSE 0 END) AS reserved_tickets,
      SUM(CASE WHEN r.statut = 'ANNULEE' THEN 1 ELSE 0 END) AS cancelled_tickets,
      SUM(
        CASE
          WHEN r.statut = 'RESERVEE'
           AND TIMESTAMP(r.date_repas, s.heure_fin) < NOW()
          THEN 1 ELSE 0
        END
      ) AS no_show_count
    FROM Reservation r
    JOIN Service_Repas s ON s.id_service = r.id_service
  `;

  const [rows] = await db.query(sql);
  return rows[0];
};

// ----------------------------

const getReservationsCountByPeriod = async (periodType, filters = {}) => {
  const { sql: whereClause, params } = buildPeriodWhereClause(periodType, filters);

  const sql = `
    SELECT COUNT(*) AS total_reservations
    FROM Reservation r
    WHERE ${whereClause}
  `;

  const [rows] = await db.query(sql, params);
  return rows[0];
};

const getUsedTicketsCountByPeriod = async (periodType, filters = {}) => {
  const { sql: whereClause, params } = buildPeriodWhereClause(periodType, filters);

  const sql = `
    SELECT COUNT(*) AS used_tickets
    FROM Reservation r
    WHERE ${whereClause}
      AND r.statut = 'VALIDEE'
  `;

  const [rows] = await db.query(sql, params);
  return rows[0];
};

const getReservedCountByPeriod = async (periodType, filters = {}) => {
  const { sql: whereClause, params } = buildPeriodWhereClause(periodType, filters);

  const sql = `
    SELECT COUNT(*) AS reserved_tickets
    FROM Reservation r
    WHERE ${whereClause}
      AND r.statut = 'RESERVEE'
  `;

  const [rows] = await db.query(sql, params);
  return rows[0];
};

const getCancelledCountByPeriod = async (periodType, filters = {}) => {
  const { sql: whereClause, params } = buildPeriodWhereClause(periodType, filters);

  const sql = `
    SELECT COUNT(*) AS cancelled_tickets
    FROM Reservation r
    WHERE ${whereClause}
      AND r.statut = 'ANNULEE'
  `;

  const [rows] = await db.query(sql, params);
  return rows[0];
};

// Cette fonction sert à préparer les données pour les graphiques de tendances de réservations :
// retourner une liste de points statistiques pour afficher l’évolution des réservations selon une période donnée :
const getReservationTrend = async (periodType, filters = {}) => {
  let sql = "";
  let params = [];

  switch (periodType) {
    case PERIOD_TYPES.DAY:
      sql = `
        SELECT
          s.type_repas AS label,
          COUNT(*) AS value
        FROM Reservation r
        JOIN Service_Repas s ON s.id_service = r.id_service
        WHERE DATE(r.date_repas) = ?
        GROUP BY s.type_repas
        ORDER BY s.type_repas ASC
      `;
      params = [filters.date];
      break;

    case PERIOD_TYPES.WEEK:
      sql = `
        SELECT
          DATE(r.date_repas) AS label,
          COUNT(*) AS value
        FROM Reservation r
        WHERE DATE(r.date_repas) BETWEEN ? AND ?
        GROUP BY DATE(r.date_repas)
        ORDER BY DATE(r.date_repas) ASC
      `;
      params = [filters.startDate, filters.endDate];
      break;

    case PERIOD_TYPES.MONTH:
      sql = `
        SELECT
          DATE(r.date_repas) AS label,
          COUNT(*) AS value
        FROM Reservation r
        WHERE YEAR(r.date_repas) = ? AND MONTH(r.date_repas) = ?
        GROUP BY DATE(r.date_repas)
        ORDER BY DATE(r.date_repas) ASC
      `;
      params = [filters.year, filters.month];
      break;

    default:
      throw new Error("Invalid period type");
  }

  const [rows] = await db.query(sql, params);
  return rows;
};

// Même principe, mais uniquement pour les tickets utilisés :
const getUsageTrend = async (periodType, filters = {}) => {
  let sql = "";
  let params = [];

  switch (periodType) {
    case PERIOD_TYPES.DAY:
      sql = `
        SELECT
          s.type_repas AS label,
          COUNT(*) AS value
        FROM Reservation r
        JOIN Service_Repas s ON s.id_service = r.id_service
        WHERE DATE(r.date_repas) = ?
          AND r.statut = 'VALIDEE'
        GROUP BY s.type_repas
        ORDER BY s.type_repas ASC
      `;
      params = [filters.date];
      break;

    case PERIOD_TYPES.WEEK:
      sql = `
        SELECT
          DATE(r.date_repas) AS label,
          COUNT(*) AS value
        FROM Reservation r
        WHERE DATE(r.date_repas) BETWEEN ? AND ?
          AND r.statut = 'VALIDEE'
        GROUP BY DATE(r.date_repas)
        ORDER BY DATE(r.date_repas) ASC
      `;
      params = [filters.startDate, filters.endDate];
      break;

    case PERIOD_TYPES.MONTH:
      sql = `
        SELECT
          DATE(r.date_repas) AS label,
          COUNT(*) AS value
        FROM Reservation r
        WHERE YEAR(r.date_repas) = ? AND MONTH(r.date_repas) = ?
          AND r.statut = 'VALIDEE'
        GROUP BY DATE(r.date_repas)
        ORDER BY DATE(r.date_repas) ASC
      `;
      params = [filters.year, filters.month];
      break;

    default:
      throw new Error("Invalid period type");
  }

  const [rows] = await db.query(sql, params);
  return rows;
};

// récupérer une série de données contenant, pour chaque jour récent, le nombre total de réservations :
const getDashboardDailyReservations = async (filters = {}) => {
  const days = Number.isInteger(filters.days) ? filters.days : 7;

  const sql = `
    SELECT
      DATE(r.date_repas) AS label,
      COUNT(*) AS value
    FROM Reservation r
    WHERE DATE(r.date_repas) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    GROUP BY DATE(r.date_repas)
    ORDER BY DATE(r.date_repas) ASC
  `;

  const [rows] = await db.query(sql, [days]);
  return rows;
};

// Pour voir la répartition déjeuner / dîner :
const getDashboardServiceSplit = async (filters = {}) => {
  const sql = `
    SELECT
      s.type_repas AS label,
      COUNT(*) AS value
    FROM Reservation r
    JOIN Service_Repas s ON s.id_service = r.id_service
    GROUP BY s.type_repas
    ORDER BY s.type_repas ASC
  `;

  const [rows] = await db.query(sql);
  return rows;
};

// Si tu veux préparer les données d’activité récente du dashboard :
const getRecentActivity = async (limit = 10) => {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;

  const sql = `
    SELECT
      r.id_reservation,
      r.date_repas,
      r.statut,
      s.type_repas,
      u.apogee,
      u.email
    FROM Reservation r
    JOIN Service_Repas s ON s.id_service = r.id_service
    JOIN Utilisateur u ON u.id_utilisateur = r.id_utilisateur
    ORDER BY r.date_creation DESC
    LIMIT ?
  `;

  const [rows] = await db.query(sql, [safeLimit]);
  return rows;
};

const getNoShowCountByPeriod = async (periodType, filters = {}) => {
  const { sql: whereClause, params } = buildPeriodWhereClause(periodType, filters);

  const sql = `
    SELECT COUNT(*) AS no_show_count
    FROM Reservation r
    JOIN Service_Repas s ON s.id_service = r.id_service
    WHERE ${whereClause}
      AND r.statut = 'RESERVEE'
      AND TIMESTAMP(r.date_repas, s.heure_fin) < NOW()
  `;

  const [rows] = await db.query(sql, params);
  return rows[0];
};

const getCancelledTrend = async (periodType, filters = {}) => {
  let sql = "";
  let params = [];

  switch (periodType) {
    case PERIOD_TYPES.DAY:
      sql = `
        SELECT
          s.type_repas AS label,
          COUNT(*) AS value
        FROM Reservation r
        JOIN Service_Repas s ON s.id_service = r.id_service
        WHERE DATE(r.date_repas) = ?
          AND r.statut = 'ANNULEE'
        GROUP BY s.type_repas
        ORDER BY s.type_repas ASC
      `;
      params = [filters.date];
      break;

    case PERIOD_TYPES.WEEK:
      sql = `
        SELECT
          DATE(r.date_repas) AS label,
          COUNT(*) AS value
        FROM Reservation r
        WHERE DATE(r.date_repas) BETWEEN ? AND ?
          AND r.statut = 'ANNULEE'
        GROUP BY DATE(r.date_repas)
        ORDER BY DATE(r.date_repas) ASC
      `;
      params = [filters.startDate, filters.endDate];
      break;

    case PERIOD_TYPES.MONTH:
      sql = `
        SELECT
          DATE(r.date_repas) AS label,
          COUNT(*) AS value
        FROM Reservation r
        WHERE YEAR(r.date_repas) = ? AND MONTH(r.date_repas) = ?
          AND r.statut = 'ANNULEE'
        GROUP BY DATE(r.date_repas)
        ORDER BY DATE(r.date_repas) ASC
      `;
      params = [filters.year, filters.month];
      break;

    default:
      throw new Error("Invalid period type");
  }

  const [rows] = await db.query(sql, params);
  return rows;
};

const getNoShowTrend = async (periodType, filters = {}) => {
  let sql = "";
  let params = [];

  switch (periodType) {
    case PERIOD_TYPES.DAY:
      sql = `
        SELECT
          s.type_repas AS label,
          COUNT(*) AS value
        FROM Reservation r
        JOIN Service_Repas s ON s.id_service = r.id_service
        WHERE DATE(r.date_repas) = ?
          AND r.statut = 'EN_ATTENTE'
          AND TIMESTAMP(r.date_repas, s.heure_fin) < NOW()
        GROUP BY s.type_repas
        ORDER BY s.type_repas ASC
      `;
      params = [filters.date];
      break;

    case PERIOD_TYPES.WEEK:
      sql = `
        SELECT
          DATE(r.date_repas) AS label,
          COUNT(*) AS value
        FROM Reservation r
        JOIN Service_Repas s ON s.id_service = r.id_service
        WHERE DATE(r.date_repas) BETWEEN ? AND ?
          AND r.statut = 'EN_ATTENTE'
          AND TIMESTAMP(r.date_repas, s.heure_fin) < NOW()
        GROUP BY DATE(r.date_repas)
        ORDER BY DATE(r.date_repas) ASC
      `;
      params = [filters.startDate, filters.endDate];
      break;

    case PERIOD_TYPES.MONTH:
      sql = `
        SELECT
          DATE(r.date_repas) AS label,
          COUNT(*) AS value
        FROM Reservation r
        JOIN Service_Repas s ON s.id_service = r.id_service
        WHERE YEAR(r.date_repas) = ? AND MONTH(r.date_repas) = ?
          AND r.statut = 'EN_ATTENTE'
          AND TIMESTAMP(r.date_repas, s.heure_fin) < NOW()
        GROUP BY DATE(r.date_repas)
        ORDER BY DATE(r.date_repas) ASC
      `;
      params = [filters.year, filters.month];
      break;

    default:
      throw new Error("Invalid period type");
  }

  const [rows] = await db.query(sql, params);
  return rows;
};

module.exports = {
  getDashboardSummary,
  getReservationsCountByPeriod,
  getUsedTicketsCountByPeriod,
  getCancelledCountByPeriod,
  getReservedCountByPeriod,
  getNoShowCountByPeriod,
  getReservationTrend,
  getUsageTrend,
  getDashboardDailyReservations,
  getDashboardServiceSplit,
  getRecentActivity,
  getCancelledTrend,
  getNoShowTrend,
};