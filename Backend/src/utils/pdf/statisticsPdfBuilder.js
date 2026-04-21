const PDFDocument = require("pdfkit");

const safeValue = (value, fallback = 0) => {
  return value === null || value === undefined ? fallback : value;
};

const drawTableHeader = (doc, y) => {
  doc
    .fillColor("#1F4E79")
    .fontSize(11)
    .text("Période", 50, y)
    .text("Réservations", 200, y)
    .text("Utilisés", 300, y)
    .text("Annulées", 390, y)
    .text("No-show", 490, y);

  doc
    .moveTo(50, y + 18)
    .lineTo(560, y + 18)
    .stroke();

  doc.fillColor("black");
};

const drawTableRow = (doc, row, y) => {
  doc
    .fontSize(10)
    .text(String(safeValue(row.label, "-")), 50, y)
    .text(String(safeValue(row.reservations)), 200, y)
    .text(String(safeValue(row.used)), 300, y)
    .text(String(safeValue(row.cancelled)), 390, y)
    .text(String(safeValue(row.noShow)), 490, y);
};

const buildStatisticsPdfBuffer = (reportData) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const {
        periodLabel,
        generatedAt,
        summary = {},
        details = [],
      } = reportData || {};

      doc
        .fillColor("#1F4E79")
        .fontSize(18)
        .text("Rapport Statistiques RU", { align: "center" });

      doc.moveDown();

      doc
        .fillColor("black")
        .fontSize(11)
        .text(`Période : ${periodLabel || "-"}`);
      doc.text(`Généré le : ${generatedAt || "-"}`);
      doc.moveDown();

      doc
        .fillColor("#1F4E79")
        .fontSize(13)
        .text("Résumé KPI");

      doc.moveDown(0.5);

      doc
        .fillColor("black")
        .fontSize(11)
        .text(`Total réservations : ${safeValue(summary.totalReservations)}`);
      doc.text(`Tickets utilisés : ${safeValue(summary.usedTickets)}`);
      doc.text(`Réservations annulées : ${safeValue(summary.cancelledTickets)}`);
      doc.text(`Taux d'utilisation : ${safeValue(summary.usageRate)}%`);
      doc.text(`No-show : ${safeValue(summary.noShowCount)}`);
      doc.text(`Taux de no-show : ${safeValue(summary.noShowRate)}%`);

      doc.moveDown();

      doc
        .fillColor("#1F4E79")
        .fontSize(13)
        .text("Détail");

      doc.moveDown(0.5);
      doc.fillColor("black");

      let y = doc.y;

      if (!details.length) {
        doc.fontSize(11).text("Aucune donnée disponible pour cette période.");
      } else {
        drawTableHeader(doc, y);
        y += 28;

        details.forEach((row) => {
          if (y > 750) {
            doc.addPage();
            y = 50;
            drawTableHeader(doc, y);
            y += 28;
          }

          drawTableRow(doc, row, y);
          y += 22;
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });

module.exports = {
  buildStatisticsPdfBuffer,
};