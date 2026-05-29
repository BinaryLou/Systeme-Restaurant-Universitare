import { CheckCircle, XCircle, ArrowRight } from "lucide-react";

const ScanResultOverlay = ({
  status,
  studentInfo,
  serviceInfo,
  errorMsg,
  onClose,
  duration = 2000,
}) => {
  const isSuccess = status === "success";

  return (
    <>
      <style>
        {`
          @keyframes shrinkProgress {
            from { width: 100%; }
            to { width: 0%; }
          }
          .progress-bar-fill {
            animation: shrinkProgress ${duration}ms linear forwards;
          }
          @keyframes floatBubble {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-8px) scale(1.03); }
          }
          .animate-float {
            animation: floatBubble 2.5s ease-in-out infinite;
          }
        `}
      </style>

      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 md:p-6 transition-all duration-300 backdrop-blur-md ${
          isSuccess
            ? "bg-gradient-to-br from-emerald-600 via-teal-650 to-emerald-800"
            : "bg-gradient-to-br from-red-650 via-rose-650 to-orange-600"
        }`}
      >
        <div className="max-w-2xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 fade-in duration-200">
          
          {/* Main Status Icon & Header */}
          <div className="mb-6 animate-float">
            {isSuccess ? (
              <CheckCircle className="w-24 h-24 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.45)]" />
            ) : (
              <XCircle className="w-24 h-24 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.45)]" />
            )}
          </div>

          <h2 className="text-4xl md:text-5xl font-black tracking-wide text-white mb-6 uppercase drop-shadow-sm">
            {isSuccess ? "Accès Autorisé" : "Accès Refusé"}
          </h2>

          {/* Student Info Box */}
          {studentInfo ? (
            <div className="w-full bg-white/15 border border-white/10 rounded-2xl p-5 mb-6 text-white text-left shadow-inner">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-white/25 border border-white/20 flex items-center justify-center text-2xl font-black text-white shrink-0 uppercase">
                  {studentInfo.prenom?.charAt(0) || ""}{studentInfo.nom?.charAt(0) || "E"}
                </div>
                <div>
                  <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold block">
                    Étudiant
                  </span>
                  <h3 className="text-xl md:text-2xl font-black">
                    {studentInfo.prenom} {studentInfo.nom}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
                <div>
                  <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold block">
                    Code Apogée
                  </span>
                  <span className="text-base font-mono font-bold text-white">
                    {studentInfo.apogee}
                  </span>
                </div>
                {isSuccess && (
                  <div>
                    <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold block">
                      Service Validé
                    </span>
                    <span className="text-base font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-lg inline-block">
                      {serviceInfo?.type_repas || "Repas"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Fallback or non-student errors */
            !isSuccess && (
              <div className="w-full bg-white/15 border border-white/10 rounded-2xl p-5 mb-6 text-white flex items-center justify-center min-h-[96px]">
                <div className="text-center">
                  <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold block mb-1">
                    Système
                  </span>
                  <h3 className="text-lg font-bold">Informations étudiant non disponibles</h3>
                </div>
              </div>
            )
          )}

          {/* Failure reason block */}
          {!isSuccess && errorMsg && (
            <div className="w-full bg-black/20 border border-white/10 rounded-2xl p-5 mb-6 text-left">
              <span className="text-white/65 text-[10px] uppercase tracking-widest font-bold block mb-1">
                Motif du refus
              </span>
              <p className="text-lg font-extrabold text-white leading-relaxed">
                {errorMsg}
              </p>
            </div>
          )}

          {/* Action Button & Timer Container */}
          <div className="w-full flex flex-col items-center gap-5 mt-2">
            <button
              onClick={onClose}
              className={`w-full py-4 px-8 rounded-2xl text-base font-black shadow-lg transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
                isSuccess
                  ? "bg-white text-emerald-850 hover:bg-emerald-50 shadow-emerald-950/20"
                  : "bg-white text-red-750 hover:bg-red-50 shadow-red-950/20"
              }`}
            >
              <span>{isSuccess ? "Scan suivant" : "Réessayer"}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Countdown visual progress bar */}
            <div className="w-full flex items-center justify-between gap-3 text-white/70 text-xs font-semibold px-1">
              <span>Auto-reset</span>
              <div className="flex-grow h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full progress-bar-fill" />
              </div>
              <span>{(duration / 1000).toFixed(1)}s</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ScanResultOverlay;
