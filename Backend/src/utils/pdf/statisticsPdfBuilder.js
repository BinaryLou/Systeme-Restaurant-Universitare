const PDFDocument = require("pdfkit");
const path = require("path");

const safeValue = (value, fallback = 0) => {
  return value === null || value === undefined ? fallback : value;
};

const drawTableHeader = (doc, y) => {
  // Background bar
  doc.rect(50, y, 495, 20)
     .fillColor("#1F4E79")
     .fill();
     
  // White bold text
  doc.fillColor("#FFFFFF")
     .font("Helvetica-Bold")
     .fontSize(9);
     
  doc.text("Période", 60, y + 6);
  doc.text("Réservations", 180, y + 6, { width: 80, align: "center" });
  doc.text("Utilisés", 270, y + 6, { width: 80, align: "center" });
  doc.text("Annulées", 360, y + 6, { width: 80, align: "center" });
  doc.text("No-show", 450, y + 6, { width: 80, align: "center" });
};

const drawTableRow = (doc, row, y, isOdd) => {
  if (isOdd) {
    doc.rect(50, y, 495, 20)
       .fillColor("#F8FAFC")
       .fill();
  }
  
  // Bottom border line
  doc.moveTo(50, y + 20)
     .lineTo(545, y + 20)
     .strokeColor("#E2E8F0")
     .lineWidth(0.5)
     .stroke();
     
  doc.fillColor("#1E293B")
     .font("Helvetica")
     .fontSize(9);
     
  doc.text(String(safeValue(row.label, "-")), 60, y + 6, { width: 110, ellipsis: true });
  doc.text(String(safeValue(row.reservations)), 180, y + 6, { width: 80, align: "center" });
  doc.text(String(safeValue(row.used)), 270, y + 6, { width: 80, align: "center" });
  doc.text(String(safeValue(row.cancelled)), 360, y + 6, { width: 80, align: "center" });
  doc.text(String(safeValue(row.noShow)), 450, y + 6, { width: 80, align: "center" });
};

const drawKpiCard = (doc, title, value, x, y, width, height) => {
  // Draw rounded card background
  doc.roundedRect(x, y, width, height, 6)
     .fillColor("#F8FAFC")
     .fill();
     
  // Draw border
  doc.roundedRect(x, y, width, height, 6)
     .strokeColor("#E2E8F0")
     .lineWidth(1)
     .stroke();
     
  // Write Title
  doc.fillColor("#64748B")
     .font("Helvetica-Bold")
     .fontSize(8)
     .text(title.toUpperCase(), x + 10, y + 10, { width: width - 20, ellipsis: true });
     
  // Write Value
  doc.fillColor("#1F4E79")
     .font("Helvetica-Bold")
     .fontSize(14)
     .text(String(value), x + 10, y + 23, { width: width - 20 });
};

const buildStatisticsPdfBuffer = (reportData) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margins: { top: 155, bottom: 80, left: 50, right: 50 }, 
        size: "A4", 
        bufferPages: true 
      });
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

      // 1. KPI cards section on the first page
      doc.fillColor("#1F4E79").font("Helvetica-Bold").fontSize(12).text("Indicateurs Clés", 50, 155);

      const colWidth = 155;
      const colGap = 15;
      const rowHeight = 45;
      const rowGap = 10;
      const startX = 50;
      const startY = 175;

      // Row 1
      drawKpiCard(doc, "Total Réservations", safeValue(summary.totalReservations), startX, startY, colWidth, rowHeight);
      drawKpiCard(doc, "Tickets Utilisés", safeValue(summary.usedTickets), startX + colWidth + colGap, startY, colWidth, rowHeight);
      drawKpiCard(doc, "Tickets Annulés", safeValue(summary.cancelledTickets), startX + 2 * (colWidth + colGap), startY, colWidth, rowHeight);

      // Row 2
      drawKpiCard(doc, "Taux d'utilisation", `${safeValue(summary.usageRate)}%`, startX, startY + rowHeight + rowGap, colWidth, rowHeight);
      drawKpiCard(doc, "No-shows", safeValue(summary.noShowCount), startX + colWidth + colGap, startY + rowHeight + rowGap, colWidth, rowHeight);
      drawKpiCard(doc, "Taux de no-show", `${safeValue(summary.noShowRate)}%`, startX + 2 * (colWidth + colGap), startY + rowHeight + rowGap, colWidth, rowHeight);

      // 2. Data details section
      doc.fillColor("#1F4E79").font("Helvetica-Bold").fontSize(12).text("Détails des Données", 50, 290);

      if (!details || details.length === 0) {
        doc.font("Helvetica-Oblique").fontSize(10).fillColor("#64748B").text("Aucune donnée disponible pour cette période.", 50, 310);
      } else {
        let y = 310;
        drawTableHeader(doc, y);
        y += 20;

        details.forEach((row, index) => {
          if (y > 720) {
            doc.addPage();
            y = 155; // reset y on the new page to start below header margin
            drawTableHeader(doc, y);
            y += 20;
          }
          drawTableRow(doc, row, y, index % 2 === 1);
          y += 20;
        });
      }

      // 3. Stamp header and footer on every buffered page
      const range = doc.bufferedPageRange();
      const logoPath = path.resolve(__dirname, "../../assets/logo-ru.png");
      const origMargins = doc.page.margins;

      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        
        // Disable margins to prevent automatic page breaks when drawing headers/footers
        doc.page.margins = { top: 0, bottom: 0, left: 0, right: 0 };

        // Draw header (Logo + Title centered)
        try {
          doc.image(logoPath, 268, 15, { width: 60 });
        } catch (imgError) {
          console.error("Logo file missing or corrupt:", imgError);
          // Fallback box in case logo load fails
          doc.rect(268, 15, 60, 60).fillColor("#E2E8F0").fill();
          doc.fillColor("#1F4E79").font("Helvetica-Bold").fontSize(8).text("RU LOGO", 278, 45);
        }

        doc.fillColor("#1F4E79")
           .font("Helvetica-Bold")
           .fontSize(14)
           .text("RESTAURANT UNIVERSITAIRE", 50, 85, { align: "center", width: 495 });

        doc.fillColor("#475569")
           .font("Helvetica")
           .fontSize(9)
           .text("Système de Gestion des Tickets - Rapport Statistique", 50, 102, { align: "center", width: 495 });

        doc.fillColor("#64748B")
           .font("Helvetica")
           .fontSize(8)
           .text(`Période : ${periodLabel || "-"}`, 50, 114, { align: "center", width: 495 });

        // Horizontal line under header
        doc.moveTo(50, 132)
           .lineTo(545, 132)
           .strokeColor("#CBD5E1")
           .lineWidth(1)
           .stroke();

        // Draw footer
        doc.moveTo(50, 785)
           .lineTo(545, 785)
           .strokeColor("#E2E8F0")
           .lineWidth(0.5)
           .stroke();

        doc.fillColor("#64748B")
           .font("Helvetica")
           .fontSize(8);

        doc.text(`Généré le ${generatedAt || "-"} | Restaurant Universitaire`, 50, 795);
        doc.text(`Page ${i + 1} sur ${range.count}`, 450, 795, { width: 95, align: "right" });
        
        // Restore margins
        doc.page.margins = origMargins;
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });

module.exports = {
  buildStatisticsPdfBuffer,
};