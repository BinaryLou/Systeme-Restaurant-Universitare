const express = require("express");
const { userLogin, forgotPasswordController } = require("../controllers/userAuthController");
const { adminLogin } = require("../controllers/adminAuthController");
const {
  handleRefreshToken,
  handleLogout,
} = require("../controllers/authTokenController");

const router = express.Router();

router.post("/user/login", userLogin);
router.post("/admin/login", adminLogin);
router.post("/refresh", handleRefreshToken);
router.post("/logout", handleLogout);

router.post("/forgot-password", forgotPasswordController);

module.exports = router;