const express = require("express");
const router = express.Router();

const verifyJwt = require("../middlewares/verifyJwt");
const requireRole = require("../middlewares/requireRole");
const { getDashboardStats } = require("../controllers/statisticsController");

router.get(
  "/dashboard/stats",
  verifyJwt,
  requireRole("ADMIN"),
  getDashboardStats
);

module.exports = router;