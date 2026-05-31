const { loginAdmin, getAdminProfile, changeAdminPassword } = require("../services/adminAuthService");
const { sendSuccess } = require("../utils/apiResponse");
const { getRequestUserId } = require("../utils/requestUser");
const AppError = require("../utils/AppError");

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await loginAdmin(email, password);

    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(
      res,
      {
        admin: result.admin,
        accessToken: result.tokens.accessToken,
      },
      "Connexion administrateur réussie",
      200
    );
  } catch (error) {
    next(error);
  }
};


const getAdminProfileController = async (req, res, next) => {
  try {
    const adminId = getRequestUserId(req);
    if (!adminId) {
      throw new AppError("Non authentifié", 401);
    }

    const profile = await getAdminProfile(adminId);
    return sendSuccess(res, profile, "Profil récupéré avec succès", 200);
  } catch (error) {
    next(error);
  }
};

const changeAdminPasswordController = async (req, res, next) => {
  try {
    const adminId = getRequestUserId(req);
    if (!adminId) {
      throw new AppError("Non authentifié", 401);
    }

    const { old_password, new_password, confirm_password } = req.body;

    await changeAdminPassword({
      adminId,
      oldPassword: old_password,
      newPassword: new_password,
      confirmPassword: confirm_password,
    });

    return sendSuccess(res, {}, "Mot de passe modifié avec succès", 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  getAdminProfileController,
  changeAdminPasswordController
};