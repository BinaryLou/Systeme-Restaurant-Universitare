const express = require("express");
const {
  getMenuByDateController,
} = require("../controllers/menuPublicController");

const router = express.Router();

router.get("/by-date/:date", getMenuByDateController);

module.exports = router;