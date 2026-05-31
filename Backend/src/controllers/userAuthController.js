const {
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../services/userAuthService");
const { sendSuccess } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const { getRequestUserId } = require("../utils/requestUser");


const userLogin = async (req, res, next) => {
  try {
    const { apogee, password } = req.body;

    const result = await loginUser({ apogee, password });

    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(
      res,
      {
        user: result.user,
        accessToken: result.tokens.accessToken,
      },
      "Connexion étudiant réussie",
      200
    );
  } catch (error) {
    next(error);
  }
};

const forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body || {};

    if (!email || typeof email !== "string" || !email.trim()) {
      return next(new AppError("L'identifiant est obligatoire", 400));
    }

    const result = await forgotPassword(email);

    const data =
      process.env.NODE_ENV !== "production"
        ? {
            dev_reset_token: result.dev_reset_token,
            expires_at: result.expires_at,
          }
        : {};

    return sendSuccess(
      res,
      data,
      "Si un compte existe avec cet email, un lien de réinitialisation a été généré",
      200
    );
  } catch (error) {
    return next(error);
  }
};

const resetPasswordController = async (req, res, next) => {
  try {
    const {
      token,
      new_password: newPassword,
      confirm_password: confirmPassword,
    } = req.body || {};

    const result = await resetPassword({
      token,
      newPassword,
      confirmPassword,
    });

    return sendSuccess(
      res,
      result,
      "Mot de passe réinitialisé avec succès",
      200
    );
  } catch (error) {
    return next(error);
  }
};

const changePasswordController = async (req, res, next) => {
  try {
    const userId = getRequestUserId(req);

    if (!userId) {
      return next(new AppError("Utilisateur non authentifié", 401));
    }

    const { old_password, new_password, confirm_password } = req.body || {};

    await changePassword({
      userId,
      oldPassword: old_password,
      newPassword: new_password,
      confirmPassword: confirm_password,
    });

    return sendSuccess(
      res,
      {},
      "Mot de passe modifié avec succès",
      200
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  userLogin,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
};