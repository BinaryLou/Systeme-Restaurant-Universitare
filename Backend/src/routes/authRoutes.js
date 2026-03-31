const express = require("express");
const verifyJwt = require("../middlewares/verifyJwt");

const {
  validateForgotPasswordPayload,
  validateResetPasswordPayload,
  validateChangePasswordPayload,
} = require("../middlewares/passwordValidation");

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

router.post("/user/login", userLogin);
router.post("/admin/login", adminLogin);
router.post("/refresh", handleRefreshToken);
router.post("/logout", handleLogout);

router.post(
  "/forgot-password",
  validateForgotPasswordPayload,
  forgotPasswordController
);

router.post(
  "/reset-password",
  validateResetPasswordPayload,
  resetPasswordController
);

router.patch(
  "/change-password",
  verifyJwt,
  validateChangePasswordPayload,
  changePasswordController
);

module.exports = router;