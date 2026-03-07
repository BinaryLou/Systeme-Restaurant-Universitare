const express = require("express");
const { studentLogin } = require("../controllers/auth_user_controler");

const router = express.Router();

router.post("/student/login", studentLogin);

module.exports = router;