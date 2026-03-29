const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");
const { processScanQrCode } = require("../services/scanService");

const scanQrCode = async (req, res, next) => {
  try {
    const { qr_code: qrCode } = req.body || {};

    if (!qrCode || typeof qrCode !== "string" || !qrCode.trim()) {
      return next(new AppError("Le champ qr_code est obligatoire", 400));
    }

    const result = await processScanQrCode({
      qrCode: qrCode.trim(),
    });

    return sendSuccess(res, result, "Scan effectué avec succès", 200);
  } catch (error) {
    return next(error);
  }
};

const scanAccessController = (req, res, next) => {
  try {
    return sendSuccess(res, {}, "Accès au scan autorisé", 200);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  scanQrCode,
  scanAccessController,
};