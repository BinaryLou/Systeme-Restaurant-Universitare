const { refreshAccessToken } = require("../services/authTokenService");
const { sendSuccess } = require("../utils/apiResponse");

const handleRefreshToken = async (req, res, next) => {
  try {
    const cookies = req.cookies

    if (!cookies?.refreshToken) {
      return next(new AppError("Refresh token manquant", 401));
    }

    const refreshToken = cookies.refreshToken

    const result = await refreshAccessToken(refreshToken);

    return sendSuccess(
      res,
      result,
      "Nouveau access token généré",
      200
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleRefreshToken,
};