import React, { useState } from "react";
import { FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { exportStatistics } from "../../api/statisticsApi";

const ExportActions = ({ period }) => {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  const handleExport = async (type) => {
    const isPdf = type === "pdf";
    if (isPdf) {
      setLoadingPdf(true);
    } else {
      setLoadingExcel(true);
    }

    try {
      // 1. Fetch file as Blob from Backend
      const blobData = await exportStatistics(period, type);
      
      // Axios responseType: 'blob' returns the Blob object directly in our setup
      const blob = new Blob([blobData], {
        type: isPdf 
          ? "application/pdf" 
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      // 2. Trigger download on the administrator's local machine
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Extract current date for standardized filename naming convention
      const extractionDate = new Date().toISOString().split("T")[0];
      const ext = isPdf ? "pdf" : "xlsx";
      
      link.setAttribute(
        "download", 
        `statistiques-${period}-${extractionDate}.${ext}`
      );

      document.body.appendChild(link);
      link.click();
      
      // Clean up DOM objects
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Export ${type.toUpperCase()} généré avec succès.`);
    } catch (err) {
      console.error(err);
      toast.error(`Erreur lors de l'export ${type.toUpperCase()}. Veuillez réessayer.`);
    } finally {
      if (isPdf) {
        setLoadingPdf(false);
      } else {
        setLoadingExcel(false);
      }
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Export PDF Button */}
      <button
        type="button"
        disabled={loadingPdf || loadingExcel}
        onClick={() => handleExport("pdf")}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingPdf ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Génération PDF...</span>
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            <span>Exporter en PDF</span>
          </>
        )}
      </button>

      {/* Export Excel Button */}
      <button
        type="button"
        disabled={loadingPdf || loadingExcel}
        onClick={() => handleExport("excel")}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingExcel ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Génération Excel...</span>
          </>
        ) : (
          <>
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exporter en Excel</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ExportActions;
