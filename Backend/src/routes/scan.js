const express = require("express");
const verifyPin = require("../middlewares/verifyPin");
const {
  scanAccessController,
  scanQrCode,
} = require("../controllers/scanController");

const router = express.Router();

router.post("/access", verifyPin, scanAccessController);
router.post("/", verifyPin, scanQrCode);

module.exports = router;