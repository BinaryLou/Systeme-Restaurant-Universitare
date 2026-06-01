const ExcelJS = require("exceljs");
const statisticsModel = require("../models/statisticsModel");

const DEFAULT_MEAL_PRICE = Number(process.env.DEFAULT_MEAL_PRICE || 2);

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

  const thinBorder = {
    top: { style: 'thin', color: { argb: 'D3D3D3' } },
    left: { style: 'thin', color: { argb: 'D3D3D3' } },
    bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
    right: { style: 'thin', color: { argb: 'D3D3D3' } }
  };

  // Feuille 1 : Résumé
  const summarySheet = workbook.addWorksheet("Résumé");
  summarySheet.showGridLines = true;

  // Banner row
  summarySheet.mergeCells("A1:B2");
  const titleCell = summarySheet.getCell("A1");
  titleCell.value = "RAPPORT STATISTIQUE - RESTAURANT UNIVERSITAIRE";
  titleCell.font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1F4E79" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };

  summarySheet.getRow(1).height = 20;
  summarySheet.getRow(2).height = 20;

  // Row 4: Section title
  summarySheet.getCell("A4").value = "Filtres Appliqués";
  summarySheet.getCell("A4").font = { name: "Calibri", size: 11, bold: true, color: { argb: "1F4E79" } };

  // Row 5: Column Headers
  const headerRow5 = summarySheet.getRow(5);
  headerRow5.values = ["Paramètre", "Valeur"];
  headerRow5.eachCell((cell) => {
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "2E75B6" } };
    cell.border = thinBorder;
  });

  const filtersData = [
    { param: "Période", val: stats.period || "-" },
    { param: "Date", val: stats.filters?.date || "-" },
    { param: "Date début", val: stats.filters?.startDate || "-" },
    { param: "Date fin", val: stats.filters?.endDate || "-" },
    { param: "Année", val: stats.filters?.year || "-" },
    { param: "Mois", val: stats.filters?.month || "-" },
  ];

  filtersData.forEach((item, i) => {
    const row = summarySheet.getRow(6 + i);
    row.values = [item.param, item.val];
    row.getCell(1).border = thinBorder;
    row.getCell(1).font = { name: "Calibri", size: 10, bold: true };
    row.getCell(2).border = thinBorder;
    row.getCell(2).font = { name: "Calibri", size: 10 };
    row.getCell(2).alignment = { horizontal: "center" };
  });

  // Row 13: Section Title
  summarySheet.getCell("A13").value = "Indicateurs de Performance (KPI) & Revenus";
  summarySheet.getCell("A13").font = { name: "Calibri", size: 11, bold: true, color: { argb: "1F4E79" } };

  // Row 14: Column Headers
  const headerRow14 = summarySheet.getRow(14);
  headerRow14.values = ["Indicateur", "Valeur"];
  headerRow14.eachCell((cell) => {
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1F4E79" } };
    cell.border = thinBorder;
  });

  const kpisData = [
    { name: "Total réservations", val: stats.summary?.totalReservations || 0, isNum: true },
    { name: "Tickets utilisés", val: stats.summary?.usedTickets || 0, isNum: true },
    { name: "Tickets annulés", val: stats.summary?.cancelledTickets || 0, isNum: true },
    { name: "Tickets réservés", val: stats.summary?.reservedTickets || 0, isNum: true },
    { name: "No-show", val: stats.summary?.noShowCount || 0, isNum: true },
    { name: "Taux d'utilisation (%)", val: (stats.summary?.usageRate || 0) / 100, isPercent: true },
    { name: "Taux d'annulation (%)", val: (stats.summary?.cancellationRate || 0) / 100, isPercent: true },
    { name: "Taux de no-show (%)", val: (stats.summary?.noShowRate || 0) / 100, isPercent: true },
    { name: "Chiffre d'affaires estimé", val: (stats.summary?.usedTickets || 0) * DEFAULT_MEAL_PRICE, isCurrency: true },
    { name: "Valeur totale des réservations", val: (stats.summary?.totalReservations || 0) * DEFAULT_MEAL_PRICE, isCurrency: true },
  ];

  kpisData.forEach((item, i) => {
    const rowNum = 15 + i;
    const row = summarySheet.getRow(rowNum);
    row.values = [item.name, item.val];
    
    const cellName = row.getCell(1);
    const cellVal = row.getCell(2);
    
    cellName.border = thinBorder;
    cellName.font = { name: "Calibri", size: 10, bold: true };
    
    cellVal.border = thinBorder;
    cellVal.font = { name: "Calibri", size: 10 };
    cellVal.alignment = { horizontal: "right" };
    
    if (i % 2 === 1) {
      cellName.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F8FAFC" } };
      cellVal.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F8FAFC" } };
    }

    if (item.isPercent) {
      cellVal.numFormat = "0.0%";
    } else if (item.isCurrency) {
      cellVal.numFormat = '#,##0.00" DH"';
      cellVal.font = { name: "Calibri", size: 10, bold: true, color: { argb: "15803D" } };
    } else if (item.isNum) {
      cellVal.numFormat = "#,##0";
    }
  });

  // Feuille 2 : Tendance des réservations
  const reservationTrendSheet = workbook.addWorksheet("Tendance Réservations");
  reservationTrendSheet.showGridLines = true;

  reservationTrendSheet.mergeCells("A1:B2");
  const titleCell2 = reservationTrendSheet.getCell("A1");
  titleCell2.value = "TENDANCE DES RÉSERVATIONS";
  titleCell2.font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFF" } };
  titleCell2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1F4E79" } };
  titleCell2.alignment = { horizontal: "center", vertical: "middle" };

  const headerRowTrend = reservationTrendSheet.getRow(4);
  headerRowTrend.values = ["Période / Label", "Réservations"];
  headerRowTrend.eachCell((cell) => {
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "2E75B6" } };
    cell.border = thinBorder;
  });

  const reservationTrend = stats.charts?.reservationTrend || [];

  if (reservationTrend.length === 0) {
    const row = reservationTrendSheet.addRow(["Aucune donnée", 0]);
    row.getCell(1).border = thinBorder;
    row.getCell(2).border = thinBorder;
  } else {
    reservationTrend.forEach((item, index) => {
      const row = reservationTrendSheet.getRow(5 + index);
      row.values = [item.label || "-", safeNumber(item.value)];
      
      const c1 = row.getCell(1);
      const c2 = row.getCell(2);
      
      c1.border = thinBorder;
      c1.font = { name: "Calibri", size: 10 };
      
      c2.border = thinBorder;
      c2.font = { name: "Calibri", size: 10 };
      c2.numFormat = "#,##0";
      c2.alignment = { horizontal: "right" };

      if (index % 2 === 1) {
        c1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F8FAFC" } };
        c2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F8FAFC" } };
      }
    });
  }

  // Feuille 3 : Tendance d'utilisation
  const usageTrendSheet = workbook.addWorksheet("Tendance Utilisation");
  usageTrendSheet.showGridLines = true;

  usageTrendSheet.mergeCells("A1:E2");
  const titleCell3 = usageTrendSheet.getCell("A1");
  titleCell3.value = "TENDANCE D'UTILISATION DES TICKETS";
  titleCell3.font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFF" } };
  titleCell3.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1F4E79" } };
  titleCell3.alignment = { horizontal: "center", vertical: "middle" };

  const headerRowUsage = usageTrendSheet.getRow(4);
  headerRowUsage.values = ["Période / Label", "Utilisés", "Annulées", "No-show", "Réservés"];
  headerRowUsage.eachCell((cell) => {
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "2E75B6" } };
    cell.border = thinBorder;
  });

  const usageTrend = stats.charts?.usageTrend || [];

  if (usageTrend.length === 0) {
    const row = usageTrendSheet.addRow(["Aucune donnée", 0, 0, 0, 0]);
    for (let c = 1; c <= 5; c++) {
      row.getCell(c).border = thinBorder;
    }
  } else {
    usageTrend.forEach((item, index) => {
      const row = usageTrendSheet.getRow(5 + index);
      row.values = [
        item.label || "-",
        safeNumber(item.usedTickets ?? item.used ?? 0),
        safeNumber(item.cancelledTickets ?? item.cancelled ?? 0),
        safeNumber(item.noShowCount ?? item.noShow ?? 0),
        safeNumber(item.reservedTickets ?? item.reserved ?? 0),
      ];

      for (let c = 1; c <= 5; c++) {
        const cell = row.getCell(c);
        cell.border = thinBorder;
        cell.font = { name: "Calibri", size: 10 };
        
        if (c > 1) {
          cell.numFormat = "#,##0";
          cell.alignment = { horizontal: "right" };
        }

        if (index % 2 === 1) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F8FAFC" } };
        }
      }
    });
  }

  // Auto-adjust column widths
  const autoFitColumns = (sheet) => {
    sheet.columns.forEach((column) => {
      let maxLen = 0;
      column.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
        if (rowNumber <= 2) return;
        
        const cellVal = cell.value;
        let displayPadding = 0;
        if (cell.numFormat) {
          if (cell.numFormat.includes("DH")) displayPadding = 5;
          else if (cell.numFormat.includes("%")) displayPadding = 2;
        }

        if (cellVal !== null && cellVal !== undefined) {
          const str = String(cellVal);
          if (str.length > maxLen) {
            maxLen = str.length + displayPadding;
          }
        }
      });
      column.width = Math.max(maxLen + 4, 15);
    });
  };

  autoFitColumns(summarySheet);
  autoFitColumns(reservationTrendSheet);
  autoFitColumns(usageTrendSheet);

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