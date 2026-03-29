const QRCode = require("qrcode");
const AppError = require("../utils/AppError");
const { findUserQrById } = require("../models/userModel");

const getMyQrCode = async (userId) => {
  const user = await findUserQrById(userId);

  if (!user) {
    throw new AppError("Utilisateur introuvable", 404);
  }

  if (!user.code_qr) {
    throw new AppError("Aucun QR code associé à cet utilisateur", 404);
  }

  const qrDataUrl = await QRCode.toDataURL(user.code_qr, {
    errorCorrectionLevel: "M",
    type: "image/png",
    margin: 2,
    width: 300,
  });

  return {
    user: {
      id: user.id_utilisateur,
      apogee: user.apogee,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
    },
    qr_code_value: user.code_qr,
    qr_code_image: qrDataUrl,
  };
};

module.exports = {
  getMyQrCode,
};