const { refreshAccessToken, logout } = require("../services/authTokenService");
const { sendSuccess } = require("../utils/apiResponse");

const handleRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken

    const result = await refreshAccessToken(refreshToken);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }
    );

    return sendSuccess(
      res,
      { accessToken: result.accessToken },
      "Nouveau access token généré",
      200
    );
  } catch (error) {
    next(error);
  }
};

const handleLogout = async (req, res, next) => {
  try {
    const cookies = req.cookies;

    if (cookies?.refreshToken) {
      await logout(cookies.refreshToken);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return sendSuccess(res, {}, "Déconnexion réussie", 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleRefreshToken,
  handleLogout,
};