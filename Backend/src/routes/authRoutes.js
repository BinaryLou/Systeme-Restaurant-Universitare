const express = require("express");
const { userLogin } = require("../controllers/userAuthController");
const { adminLogin } = require("../controllers/adminAuthController");

const router = express.Router();

router.post("/user/login", userLogin);
router.post("/admin/login", adminLogin);

module.exports = router;