const { sendSuccess } = require("../utils/apiResponse");
const { getMyQrCode } = require("../services/userService");

const getMyQrCodeController = async (req, res, next) => {
  try {
    const userId = req.user.id_utilisateur || req.user.id;
    const result = await getMyQrCode(userId);

    return sendSuccess(res, result, "QR récupéré avec succès", 200);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyQrCodeController,
};