const { loginUser, forgotPassword } = require("../services/userAuthService");
const { sendSuccess } = require("../utils/apiResponse");

const userLogin = async (req, res, next) => {
  try {
    const { apogee, password } = req.body;

    const result = await loginUser({ apogee, password });
    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: false, // true en production
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
      return next(new AppError("L'email est obligatoire", 400));
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

module.exports = {
  userLogin,
  forgotPasswordController,
};