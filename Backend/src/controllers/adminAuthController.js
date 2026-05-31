const { loginAdmin } = require("../services/adminAuthService");
const { sendSuccess } = require("../utils/apiResponse");

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

module.exports = {
  adminLogin
};