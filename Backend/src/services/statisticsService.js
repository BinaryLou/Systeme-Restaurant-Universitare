const statisticsModel = require("../models/statisticsModel");

const safeNumber = (value) => {
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

const calculateRate = (part, total) => {
  const safePart = safeNumber(part);
  const safeTotal = safeNumber(total);

  if (safeTotal === 0) return 0;

  return Math.round((safePart / safeTotal) * 100);
};

const buildSummaryMetrics = ({
  totalReservations,
  usedTickets,
  cancelledTickets,
  noShowCount,
}) => {
  const total = safeNumber(totalReservations);
  const used = safeNumber(usedTickets);
  const cancelled = safeNumber(cancelledTickets);
  const noShow = safeNumber(noShowCount);

  return {
    totalReservations: total,
    usedTickets: used,
    cancelledTickets: cancelled,
    noShowCount: noShow,
    usageRate: calculateRate(used, total),
    cancellationRate: calculateRate(cancelled, total),
    noShowRate: calculateRate(noShow, total),
  };
};

const getDashboardStats = async () => {
  const summaryRow = await statisticsModel.getDashboardSummary();
  const dailyReservationsRows =
    await statisticsModel.getDashboardDailyReservations();
  const serviceSplitRows = await statisticsModel.getDashboardServiceSplit();
  const recentActivityRows = await statisticsModel.getRecentActivity();

  const summary = buildSummaryMetrics({
    totalReservations: summaryRow?.total_reservations,
    usedTickets: summaryRow?.used_tickets,
    cancelledTickets: summaryRow?.cancelled_tickets,
    noShowCount: summaryRow?.no_show_count,
  });

  return {
    cards: {
      ...summary,
      reservationsToday: safeNumber(summaryRow?.reservations_today),
      reservationsThisWeek: safeNumber(summaryRow?.reservations_this_week),
      reservedTickets: safeNumber(summaryRow?.reserved_tickets),
    },
    charts: {
      dailyReservations: dailyReservationsRows || [],
      serviceSplit: serviceSplitRows || [],
    },
    recentActivity: recentActivityRows || [],
  };
};

const getDetailedStatistics = async (filters) => {
  const periodType = filters.period;

  const summaryRow = await statisticsModel.getReservationsCountByPeriod(
    periodType,
    filters
  );

  const usedRow = await statisticsModel.getUsedTicketsCountByPeriod(
    periodType,
    filters
  );

  const cancelledRow = await statisticsModel.getCancelledCountByPeriod(
    periodType,
    filters
  );

  const reservedRow = await statisticsModel.getReservedCountByPeriod(
    periodType,
    filters
  );

  const noShowRow = await statisticsModel.getNoShowCountByPeriod(
    periodType,
    filters
  );

  const trendRows = await statisticsModel.getReservationTrend(
    periodType,
    filters
  );

  const usageTrendRows = await statisticsModel.getUsageTrend(
    periodType,
    filters
  );

  const summary = buildSummaryMetrics({
    totalReservations: summaryRow?.total_reservations,
    usedTickets: usedRow?.used_tickets,
    cancelledTickets: cancelledRow?.cancelled_tickets,
    noShowCount: noShowRow?.no_show_count,
  });

  return {
    period: periodType,
    filters,
    summary: {
      ...summary,
      reservedTickets: safeNumber(reservedRow?.reserved_tickets),
    },
    charts: {
      reservationTrend: trendRows || [],
      usageTrend: usageTrendRows || [],
    },
  };
};

module.exports = {
  getDashboardStats,
  getDetailedStatistics,
  buildSummaryMetrics,
};