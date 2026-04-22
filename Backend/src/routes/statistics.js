const express = require("express");
const router = express.Router();

const verifyJwt = require("../middlewares/verifyJwt");
const requireRole = require("../middlewares/requireRole");
const validateStatisticsFilters = require("../middlewares/statisticsValidation");
const {
  getDashboardStats,
  getDetailedStatistics,
  exportStatisticsExcel,
  exportStatisticsPdf,
} = require("../controllers/statisticsController");

router.get(
  "/dashboard/stats",
  verifyJwt,
  requireRole("ADMIN"),
  getDashboardStats
);

router.get(
  "/statistics",
  verifyJwt,
  requireRole("ADMIN"),
  validateStatisticsFilters,
  getDetailedStatistics
);

router.get(
  "/statistics/export/excel",
  verifyJwt,
  requireRole("ADMIN"),
  validateStatisticsFilters,
  exportStatisticsExcel
);

router.get(
  "/statistics/export/pdf",
  verifyJwt,
  requireRole("ADMIN"),
  validateStatisticsFilters,
  exportStatisticsPdf
);

module.exports = router;