const express = require("express");
const verifyPin = require("../middlewares/verifyPin");
const { scanAccessController } = require("../controllers/scanController");

const router = express.Router();

router.post("/access", verifyPin, scanAccessController);

module.exports = router;