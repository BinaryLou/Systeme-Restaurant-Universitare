const express = require("express");
const pool = require("../config/db");
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API running'
  });
});

router.get("/db", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * from menu ");
    res.json({
      status: "database connected",
      result: rows
    });
  } catch (err) {
    err.statusCode = 500;
    return next(err);
  }
});

module.exports = router;
