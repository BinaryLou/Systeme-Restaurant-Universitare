const { loginUser } = require("../services/userAuthService");

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

    return res.status(200).json({
      status: "success",
      message: "Connexion étudiant réussie",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  userLogin
};