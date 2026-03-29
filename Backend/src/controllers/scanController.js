const AppError = require("../utils/AppError");
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

    return res.status(200).json({
      status: "success",
      data: result,
      message: "Scan effectué avec succès",
    });
  } catch (error) {
    return next(error);
  }
};

const scanAccessController = (req, res, next) => {
  try {
    return res.status(200).json({
      status: "success",
      data: {},
      message: "Accès au scan autorisé",
    });
  } catch (error) {
    return next(error);
    next(error);
  }
};

module.exports = {
  scanQrCode,
  scanAccessController,
};