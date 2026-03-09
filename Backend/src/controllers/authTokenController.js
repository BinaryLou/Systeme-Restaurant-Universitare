const { refreshAccessToken } = require("../services/authTokenService");
const { sendSuccess } = require("../utils/apiResponse");

const handleRefreshToken = async (req, res, next) => {
  try {
    //const { refreshToken } = req.cookies.refreshToken;
    const { refreshToken } = req.body

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