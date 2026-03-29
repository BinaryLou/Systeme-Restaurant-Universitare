const { getMyQrCode } = require("../services/userService");

const getMyQrCodeController = async (req, res, next) => {
  try {
    const result = await getMyQrCode(req.user.id);

    return res.status(200).json({
      status: "success",
      data: result,
      message: "QR récupéré avec succès",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyQrCodeController,
};