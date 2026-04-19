const express = require("express");
const router = express.Router();

const verifyJwt = require("../middlewares/verifyJwt");
const requireRole = require("../middlewares/requireRole");
const {
  getDashboardStats,
  getDetailedStatistics,
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
  getDetailedStatistics
);

module.exports = router;