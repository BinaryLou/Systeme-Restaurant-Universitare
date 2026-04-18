const statisticsService = require("../services/statisticsService");
const { sendSuccess } = require("../utils/apiResponse");

const getDashboardStats = async (req, res, next) => {
  try {
    const dashboardStats = await statisticsService.getDashboardStats();

    return sendSuccess(
      res,
      dashboardStats,
      "Statistiques du dashboard récupérées avec succès",
      200
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboardStats,
};