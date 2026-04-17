const staticsModel = require("../models/statisticsModel");

const safeNumber = (value) => {
    const num = Number(value);
    return Number.isNaN(num) ? 0 : num;
};

const calculRate = (part, total) => {
    const safePart = safeNumber(part);
    const safeTotal = safeNumber(total);

    if (safeTotal === 0) return 0;

    return Math.round((safePart / safeTotal) * 100);
};

const buildSummaryMetrics = ({ totalReservations, usedTickets, noShowCount }) => {
    const total = safeNumber(totalReservations);
    const used = safeNumber(usedTickets);
    const noShow = safeNumber(noShowCount);

    return {
        totalReservations: total,
        usedTickets: used,
        noShowCount: noShow,
        usageRate: calculateRate(used, total),
        noShowRate: calculateRate(noShow, total),
    };
};

const getDashboardStats = async () => {
    const summaryRow = await statisticsModel.getDashboardSummary();
    const trendRows = await statisticsModel.getDashboardCharts();

    const summary = buildSummaryMetrics({
        totalReservations: summaryRow?.totalReservations,
        usedTickets: summaryRow?.usedTickets,
        noShowCount: summaryRow?.noShowCount,
    });

    return {
        cards: summary,
        charts: {
            trend: trendRows || [],
        },
    };
};

const getDetailedStatistics = async (filters) => {
    const summaryRow = await statisticsModel.getReservationsCountByPeriod(filters);
    const usedRow = await statisticsModel.getUsedTicketsCountByPeriod(filters);
    const noShowRow = await statisticsModel.getNoShowCountByPeriod(filters);
    const trendRows = await statisticsModel.getReservationTrend(filters);

    const summary = buildSummaryMetrics({
        totalReservations: summaryRow?.totalReservations,
        usedTickets: usedRow?.usedTickets,
        noShowCount: noShowRow?.noShowCount,
    });

    return {
        period: filters.period,
        filters,
        summary,
        charts: {
            trend: trendRows || [],
        },
    };
};

module.exports = {
  getDashboardStats,
  getDetailedStatistics,
  buildSummaryMetrics,
};

