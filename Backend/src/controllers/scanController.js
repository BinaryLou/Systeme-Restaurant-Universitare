const scanAccessController = (req, res, next) => {
  try {
    return res.status(200).json({
      status: "success",
      data: {},
      message: "Accès au scan autorisé",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scanAccessController,
};