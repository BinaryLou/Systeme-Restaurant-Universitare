const { sendSuccess } = require("../utils/apiResponse");
const { resolveMenuByDate } = require("../services/menuResolverService");

const getMenuByDateController = async (req, res, next) => {
  try {
    const { date } = req.params;

    const data = await resolveMenuByDate(date);

    return sendSuccess(
      res,
      data,
      "Menu récupéré avec succès",
      200
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMenuByDateController,
};