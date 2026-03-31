const express = require("express");
const {
  userLogin,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
} = require("../controllers/userAuthController");
const { adminLogin } = require("../controllers/adminAuthController");
const {
  handleRefreshToken,
  handleLogout,
} = require("../controllers/authTokenController");

const router = express.Router();

const verifyJwt = require("../middlewares/verifyJwt");

router.post("/user/login", userLogin);
router.post("/admin/login", adminLogin);
router.post("/refresh", handleRefreshToken);
router.post("/logout", handleLogout);

router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);
router.patch("/change-password", verifyJwt, changePasswordController);

module.exports = router;