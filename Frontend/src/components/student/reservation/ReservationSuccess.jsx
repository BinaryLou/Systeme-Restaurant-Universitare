import { Check, QrCode, History, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const ReservationSuccess = ({ reservation }) => {
  const [showAll, setShowAll] = useState(false);

  const visibleReservations = showAll
    ? reservation.successData
    : reservation.successData.slice(0, 4);

  const hiddenCount = reservation.successData.length - 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f8fafc] to-green-50 px-6 py-6">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#08b94e] text-white shadow-xl shadow-green-500/30">
            <Check size={36} strokeWidth={3} />
          </div>

          <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
            Réservation confirmée
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Vos repas ont été réservés avec succès.
          </p>
        </div>

        {/* Card */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-green-100 bg-white shadow-xl shadow-slate-900/10">
          <div className="bg-[#08b94e] px-6 py-4 text-white">
            <h2 className="text-lg font-bold">Résumé de vos réservations</h2>
            <p className="mt-1 text-xs text-green-50">
              {reservation.successData.length} réservation(s) sécurisée(s)
            </p>
          </div>

          <div className="divide-y divide-slate-100 px-5">
            {visibleReservations.map((item, index) => (
              <div
                key={`${item.date}-${item.service}-${index}`}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div>
                  <p className="text-sm font-bold capitalize text-slate-900">
                    {reservation.formatLongDate(item.date)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.service} — {item.time}
                  </p>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  Sécurisé
                </span>
              </div>
            ))}
          </div>

          {reservation.successData.length > 4 && (
            <div className="border-t border-slate-100 px-5 py-3 text-center">
              <button
                onClick={() => setShowAll((prev) => !prev)}
                className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-2 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-[#1d4fed]/30 hover:bg-blue-50 hover:text-[#1d4fed] hover:shadow-md"
              >
                {showAll ? (
                  <>
                    Afficher moins
                    <ChevronUp
                      size={17}
                      className="transition group-hover:-translate-y-0.5"
                    />
                  </>
                ) : (
                  <>
                    Afficher plus
                    <ChevronDown
                      size={17}
                      className="transition group-hover:translate-y-0.5"
                    />
                    <span className="text-slate-400">(+{hiddenCount})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-center text-sm font-medium text-blue-700">
          Présentez votre QR Code le jour du repas au restaurant universitaire.
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => reservation.navigate("/student/qrcode")}
            className="group flex items-center justify-center gap-3 rounded-2xl bg-[#1d4fed] px-6 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.98]"
          >
            <QrCode
              size={22}
              className="transition group-hover:rotate-6 group-hover:scale-110"
            />
            Voir mon QR Code
          </button>

          <button
            onClick={() => reservation.navigate("/student/historique")}
            className="group flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 font-bold text-slate-800 shadow-sm transition hover:-translate-y-1 hover:border-[#1d4fed]/30 hover:bg-blue-50 hover:text-[#1d4fed] hover:shadow-xl active:scale-[0.98]"
          >
            <History
              size={22}
              className="transition group-hover:-rotate-6 group-hover:scale-110"
            />
            Voir mes réservations
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationSuccess;