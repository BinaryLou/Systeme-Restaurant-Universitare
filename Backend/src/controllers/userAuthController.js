const { loginUser } = require("../services/userAuthService");
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

module.exports = {
  userLogin
};