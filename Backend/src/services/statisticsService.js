const ExcelJS = require("exceljs");
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

const buildStatisticsExcelWorkbook = async (filters) => {
  const stats = await getDetailedStatistics(filters);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "RU Ticket";
  workbook.created = new Date();
  workbook.modified = new Date();

  // Feuille 1 : Résumé
  const summarySheet = workbook.addWorksheet("Résumé");

  summarySheet.columns = [
    { header: "Champ", key: "field", width: 30 },
    { header: "Valeur", key: "value", width: 20 },
  ];

  summarySheet.addRow({ field: "Période", value: stats.period || "-" });
  summarySheet.addRow({ field: "Date", value: stats.filters?.date || "-" });
  summarySheet.addRow({
    field: "Date début",
    value: stats.filters?.startDate || "-",
  });
  summarySheet.addRow({
    field: "Date fin",
    value: stats.filters?.endDate || "-",
  });
  summarySheet.addRow({ field: "Année", value: stats.filters?.year || "-" });
  summarySheet.addRow({ field: "Mois", value: stats.filters?.month || "-" });

  summarySheet.addRow({});

  summarySheet.addRow({
    field: "Total réservations",
    value: stats.summary?.totalReservations || 0,
  });
  summarySheet.addRow({
    field: "Tickets utilisés",
    value: stats.summary?.usedTickets || 0,
  });
  summarySheet.addRow({
    field: "Tickets annulés",
    value: stats.summary?.cancelledTickets || 0,
  });
  summarySheet.addRow({
    field: "Tickets réservés",
    value: stats.summary?.reservedTickets || 0,
  });
  summarySheet.addRow({
    field: "No-show",
    value: stats.summary?.noShowCount || 0,
  });
  summarySheet.addRow({
    field: "Taux d'utilisation (%)",
    value: stats.summary?.usageRate || 0,
  });
  summarySheet.addRow({
    field: "Taux d'annulation (%)",
    value: stats.summary?.cancellationRate || 0,
  });
  summarySheet.addRow({
    field: "Taux de no-show (%)",
    value: stats.summary?.noShowRate || 0,
  });

  summarySheet.getRow(1).font = { bold: true };

  // Feuille 2 : Tendance des réservations
  const reservationTrendSheet = workbook.addWorksheet("Reservation Trend");

  reservationTrendSheet.columns = [
    { header: "Label", key: "label", width: 25 },
    { header: "Réservations", key: "value", width: 20 },
  ];

  const reservationTrend = stats.charts?.reservationTrend || [];

  if (reservationTrend.length === 0) {
    reservationTrendSheet.addRow({ label: "Aucune donnée", value: 0 });
  } else {
    reservationTrend.forEach((item) => {
      reservationTrendSheet.addRow({
        label: item.label || "-",
        value: safeNumber(item.value),
      });
    });
  }

  reservationTrendSheet.getRow(1).font = { bold: true };

  // Feuille 3 : Tendance d'utilisation
  const usageTrendSheet = workbook.addWorksheet("Usage Trend");

  usageTrendSheet.columns = [
    { header: "Label", key: "label", width: 25 },
    { header: "Utilisés", key: "used", width: 15 },
    { header: "Annulés", key: "cancelled", width: 15 },
    { header: "No-show", key: "noShow", width: 15 },
    { header: "Réservés", key: "reserved", width: 15 },
  ];

  const usageTrend = stats.charts?.usageTrend || [];

  if (usageTrend.length === 0) {
    usageTrendSheet.addRow({
      label: "Aucune donnée",
      used: 0,
      cancelled: 0,
      noShow: 0,
      reserved: 0,
    });
  } else {
    usageTrend.forEach((item) => {
      usageTrendSheet.addRow({
        label: item.label || "-",
        used: safeNumber(item.usedTickets ?? item.used ?? 0),
        cancelled: safeNumber(item.cancelledTickets ?? item.cancelled ?? 0),
        noShow: safeNumber(item.noShowCount ?? item.noShow ?? 0),
        reserved: safeNumber(item.reservedTickets ?? item.reserved ?? 0),
      });
    });
  }

  usageTrendSheet.getRow(1).font = { bold: true };

  return workbook;
};


const exportStatisticsExcel = async (filters) => {
  const workbook = await buildStatisticsExcelWorkbook(filters);
  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);
};

const buildPeriodLabel = (filters = {}) => {
  const { period, date, startDate, endDate, year, month } = filters;

  if (period === "day") return `Jour : ${date}`;
  if (period === "week") return `Semaine : ${startDate} → ${endDate}`;
  if (period === "month") return `Mois : ${month}/${year}`;

  return "Période non spécifiée";
};

const formatLabel = (value) => {
  if (!value) return "-";

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const str = String(value);
  return str.length >= 10 ? str.slice(0, 10) : str;
};

const getStatisticsForPdf = async (filters = {}) => {
  const detailedStatistics = await getDetailedStatistics(filters);

  const reservationTrend = detailedStatistics?.charts?.reservationTrend || [];
  const usageTrend = detailedStatistics?.charts?.usageTrend || [];

  const usageMap = new Map(
    usageTrend.map((item) => [formatLabel(item.label), safeNumber(item.value)])
  );

  const cancelledTrend = await statisticsModel.getCancelledTrend(
    filters.period,
    filters
  );

  const cancelledMap = new Map(
    cancelledTrend.map((item) => [
      formatLabel(item.label),
      safeNumber(item.value),
    ])
  );

  const noShowTrend = await statisticsModel.getNoShowTrend(
    filters.period,
    filters
  );

  const noShowMap = new Map(
    noShowTrend.map((item) => [formatLabel(item.label), safeNumber(item.value)])
  );

  const details = reservationTrend.map((item) => {
    const label = formatLabel(item.label);
    const reservations = safeNumber(item.value);
    const used = usageMap.get(label) || 0;
    const cancelled = cancelledMap.get(label) || 0;
    const noShow = noShowMap.get(label) || 0;

    return {
      label,
      reservations,
      used,
      cancelled,
      noShow,
    };
  });

  return {
    periodLabel: buildPeriodLabel(filters),
    generatedAt: new Date().toLocaleString("fr-FR"),
    summary: {
      totalReservations: safeNumber(
        detailedStatistics?.summary?.totalReservations
      ),
      usedTickets: safeNumber(detailedStatistics?.summary?.usedTickets),
      cancelledTickets: safeNumber(
        detailedStatistics?.summary?.cancelledTickets
      ),
      usageRate: safeNumber(detailedStatistics?.summary?.usageRate),
      noShowCount: safeNumber(detailedStatistics?.summary?.noShowCount),
      noShowRate: safeNumber(detailedStatistics?.summary?.noShowRate),
    },
    details,
  };
};

module.exports = {
  getDashboardStats,
  getDetailedStatistics,
  buildSummaryMetrics,
  exportStatisticsExcel,
  getStatisticsForPdf,
};