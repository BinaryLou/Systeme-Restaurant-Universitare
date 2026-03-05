const express = require("express");
const pool = require("../config/db");
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API running'
  });
});

router.get("/db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1");
    res.json({
      status: "database connected",
      result: rows
    });
  } catch (err) {
    res.status(500).json({
        status: "error", 
        message: err.message
    });
  }
});

module.exports = router;