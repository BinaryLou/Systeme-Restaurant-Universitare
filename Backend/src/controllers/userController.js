const { sendSuccess } = require("../utils/apiResponse");
const { getMyQrCode } = require("../services/userService");
const { getRequestUserId } = require("../utils/requestUser");

const getMyQrCodeController = async (req, res, next) => {
  try {
    const userId = getRequestUserId(req);
    const result = await getMyQrCode(userId);

    return sendSuccess(res, result, "QR récupéré avec succès", 200);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyQrCodeController,
};