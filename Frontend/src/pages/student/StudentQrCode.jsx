import { useEffect, useState } from "react";
import { Download, QrCode, CheckCircle, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";
import { getStudentQrCode } from "../../api/studentApi";
import logoRU from "../../assets/logo-ru.png";
import { toast } from "react-hot-toast";

const StudentQrCode = () => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchQrCode = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getStudentQrCode();
      setQrData(data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Impossible de récupérer votre QR Code.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchQrCode();
  }, []);


  const downloadPng = () => {
    if (!qrData?.qr_code_image) {
      toast.error("Impossible de télécharger le QR Code.");
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = qrData.qr_code_image;
      link.download = `qr-code-${qrData.user?.apogee || "student"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR Code téléchargé en PNG !");
    } catch (err) {
      toast.error("Erreur lors du téléchargement PNG.");
    }
  };

  const downloadPdf = () => {
    if (!qrData?.qr_code_image) {
      toast.error("Impossible de télécharger le QR Code.");
      return;
    }

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();

    // Background
    doc.setFillColor(248, 251, 255);
    doc.rect(0, 0, 210, 297, "F");

    // Header
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(20, 18, 170, 34, 5, 5, "F");

    // Logo white circle
    doc.setFillColor(255, 255, 255);
    doc.circle(38, 35, 12, "F");

    // Logo
    doc.addImage(logoRU, "PNG", 29, 26, 18, 18);

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text("Restaurant Universitaire", 58, 33);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("Ticket numerique personnel - RU Ticket", 58, 41);

    // Status badge
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(60, 65, 90, 12, 3, 3, "FD");

    doc.setTextColor(22, 101, 52);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Code actif et valide", pageWidth / 2, 73, {
      align: "center",
    });

    // QR card
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(55, 88, 100, 100, 5, 5, "FD");

    doc.addImage(qrData.qr_code_image, "PNG", 70, 103, 70, 70);

    // Student info card
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(30, 203, 150, 34, 4, 4, "FD");

    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);

    doc.text("CODE APOGEE", 55, 216, { align: "center" });
    doc.text("ETUDIANT", 135, 216, { align: "center" });

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);

    doc.text(`${qrData.user?.apogee || "-"}`, 55, 227, {
      align: "center",
    });

    doc.text(
      `${qrData.user?.prenom || ""} ${qrData.user?.nom || ""}`,
      135,
      227,
      { align: "center" },
    );

    // Footer line
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.4);
    doc.line(35, 260, 175, 260);

    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      "Presentez ce QR Code a l'entree du restaurant universitaire.",
      pageWidth / 2,
      268,
      { align: "center" },
    );

    doc.save(`qr-code-${qrData.user?.apogee || "student"}.pdf`);
    toast.success("QR Code téléchargé en PDF !");
    } catch (err) {
      toast.error("Erreur lors du téléchargement PDF.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="h-28 animate-pulse rounded-2xl bg-blue-100" />
          <div className="mt-8 h-96 animate-pulse rounded-2xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-lg rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-slate-900">
            QR Code indisponible
          </h2>
          <p className="mt-2 text-sm text-slate-500">{error}</p>

          <button
            onClick={fetchQrCode}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const user = qrData?.user;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white shadow-lg">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15">
              <QrCode className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-wide">Mon QR Code</h1>
              <p className="mt-1 text-sm text-blue-100">
                Code personnel pour accéder au restaurant
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-md">
          <div className="flex items-center justify-center gap-3 border-b border-green-100 bg-green-50 px-6 py-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span className="font-semibold text-green-700">
              Code actif et valide
            </span>
          </div>

          <div className="p-8">
            <div className="flex justify-center">
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
                <img
                  src={qrData?.qr_code_image}
                  alt="QR Code étudiant"
                  className="h-64 w-64 object-contain"
                />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Code Apogée
                </p>
                <p className="mt-2 font-bold text-slate-900">
                  {user?.apogee || "-"}
                </p>
              </div>

              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Étudiant
                </p>
                <p className="mt-2 font-bold text-slate-900">
                  {user?.prenom} {user?.nom}
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <button
                onClick={downloadPng}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 font-semibold text-white shadow-md hover:bg-blue-700"
              >
                <Download className="h-5 w-5" />
                Télécharger en PNG
              </button>

              <button
                onClick={downloadPdf}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-4 font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
              >
                <Download className="h-5 w-5" />
                Télécharger en PDF
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-7">
          <h2 className="text-xl font-bold text-blue-900">
            Comment utiliser votre QR Code ?
          </h2>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                1
              </span>
              <p className="text-blue-900">
                Présentez ce QR Code à l’entrée du restaurant universitaire
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                2
              </span>
              <p className="text-blue-900">
                Le personnel scannera votre code pour valider votre réservation
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                3
              </span>
              <p className="text-blue-900">
                Conservez ce code sur votre téléphone ou imprimez-le
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQrCode;
