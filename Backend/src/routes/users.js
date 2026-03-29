const express = require("express");
const verifyJwt = require("../middlewares/verifyJwt");
const { getMyQrCodeController } = require("../controllers/userController");

const router = express.Router();

router.get("/me/qr", verifyJwt, getMyQrCodeController);

module.exports = router;