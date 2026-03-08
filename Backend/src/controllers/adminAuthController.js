const { loginAdmin } = require("../services/adminAuthService");

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await loginAdmin(email, password);

    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: false, // mettre true en production avec HTTPS
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: "success",
      message: "Connexion administrateur réussie",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin
};