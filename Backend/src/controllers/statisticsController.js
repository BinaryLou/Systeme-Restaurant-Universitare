const statisticsService = require("../services/statisticsService");
const { buildStatisticsPdfBuffer } = require("../utils/pdf/statisticsPdfBuilder");
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

const getDetailedStatistics = async (req, res, next) => {
  try {
    const filters = {
      period: req.query.period,
      date: req.query.date,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      year: req.query.year ? Number(req.query.year) : undefined,
      month: req.query.month ? Number(req.query.month) : undefined,
    };

    const detailedStatistics =
      await statisticsService.getDetailedStatistics(filters);

    return sendSuccess(
      res,
      detailedStatistics,
      "Statistiques détaillées récupérées avec succès",
      200
    );
  } catch (error) {
    return next(error);
  }
};

const exportStatisticsPdf = async (req, res, next) => {
  try {
    const filters = {
      period: req.query.period,
      date: req.query.date,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      year: req.query.year ? Number(req.query.year) : undefined,
      month: req.query.month ? Number(req.query.month) : undefined,
    };

    const reportData = await statisticsService.getStatisticsForPdf(filters);
    const pdfBuffer = await buildStatisticsPdfBuffer(reportData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="statistics-report.pdf"'
    );

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboardStats,
  getDetailedStatistics,
  exportStatisticsPdf,
};