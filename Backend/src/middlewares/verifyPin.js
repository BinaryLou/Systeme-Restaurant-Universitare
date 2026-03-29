const AppError = require("../utils/AppError");

const verifyPin = (req, res, next) => {
  const pin = req.headers["x-scan-pin"] || req.body.pin;

  if (!pin) {
    return next(new AppError("PIN manquant", 403));
  }

  if (pin !== process.env.SCAN_PIN) {
    return next(new AppError("PIN invalide", 403));
  }

  return next();
  next();
};

module.exports = verifyPin;