import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, Layers, UserCheck, QrCode, Camera } from "lucide-react";
import QRScanner from "../../components/staff/QRScanner";
import { validateTicket } from "../../api/scanApi";

const ScanDashboard = () => {
  const pin = sessionStorage.getItem("staffPin");

  const [isScanningActive, setIsScanningActive] = useState(false);
  const [validationState, setValidationState] = useState("idle"); // idle | loading | success | error
  const [studentInfo, setStudentInfo] = useState(null);
  const [serviceInfo, setServiceInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [sessionCount, setSessionCount] = useState(() => {
    const saved = sessionStorage.getItem("scanSessionCount");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [scanHistory, setScanHistory] = useState([]);
  const [isScanLocked, setIsScanLocked] = useState(false);

  // Audio synthesis feedback (success/error sounds)
  const playAudioFeedback = (type) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        // High pitch pleasant chime (A5 chord element)
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime); 
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } else {
        // Lower pitch dual-tone buzzer
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, ctx.currentTime); 
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (err) {
      console.error("Audio feedback error:", err);
    }
  };

  const handleScanSuccess = async (decodedText) => {
    if (validationState !== "idle" || isScanLocked) return;

    setIsScanLocked(true);
    const scanStart = Date.now();

    setValidationState("loading");
    setErrorMsg("");

    const releaseLock = () => {
      const elapsed = Date.now() - scanStart;
      const remaining = Math.max(0, 2000 - elapsed);
      setTimeout(() => {
        setIsScanLocked(false);
      }, remaining);
    };

    try {
      const response = await validateTicket(decodedText, pin);
      const payload = response.data || {};
      const user = payload.user;
      const service = payload.service;
      
      setStudentInfo(user);
      setServiceInfo(service);
      setValidationState("success");
      playAudioFeedback("success");

      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      sessionStorage.setItem("scanSessionCount", newCount);

      setScanHistory((prev) => [
        {
          id: Date.now(),
          nom: user?.nom || "Inconnu",
          prenom: user?.prenom || "",
          apogee: user?.apogee || "N/A",
          service: service?.type_repas || "Repas",
          time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          status: "success",
        },
        ...prev.slice(0, 4),
      ]);

      releaseLock();
    } catch (err) {
      console.error("Scan validation error:", err);
      const message = err.message || "Une erreur est survenue lors de la validation.";
      setErrorMsg(message);
      setValidationState("error");
      playAudioFeedback("error");

      // Extract user info if available in the error payload
      const responsePayload = err.data || err.response?.data || {};
      const payloadData = responsePayload.data || {};
      const user = payloadData.user;

      if (user) {
        setStudentInfo(user);
      }

      setScanHistory((prev) => [
        {
          id: Date.now(),
          nom: user ? user.nom : "Scan Refusé",
          prenom: user ? user.prenom : "",
          apogee: user ? user.apogee : "Code inconnu",
          service: "Non validé",
          time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          status: "error",
          reason: message,
        },
        ...prev.slice(0, 4),
      ]);

      releaseLock();
    }
  };

  useEffect(() => {
    if (validationState === "success" || validationState === "error") {
      const timer = setTimeout(() => {
        handleReset();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [validationState]);

  const handleReset = () => {
    setValidationState("idle");
    setStudentInfo(null);
    setServiceInfo(null);
    setErrorMsg("");
  };

  return (
    <>
      <style>
        {`
          @keyframes pulseScale {
            0%, 100% { transform: scale(1); opacity: 0.85; }
            50% { transform: scale(1.05); opacity: 1; }
          }
          .pulse-indicator {
            animation: pulseScale 2s infinite ease-in-out;
          }
        `}
      </style>

      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 animate-in fade-in duration-300">
        
        {/* Left Column: Scanner Panel & Session Counter */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Live Scanner Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-3.5 sm:p-5 md:p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isScanningActive ? "bg-blue-600 animate-pulse" : "bg-slate-300"}`}></span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Scanner en direct
                </h2>
              </div>
              {isScanningActive && (
                <button
                  onClick={() => setIsScanningActive(false)}
                  className="text-xs font-bold text-red-500 hover:text-red-650 transition cursor-pointer"
                >
                  Arrêter la caméra
                </button>
              )}
            </div>

            {isScanningActive ? (
              <QRScanner
                onScanSuccess={handleScanSuccess}
                paused={validationState !== "idle" || isScanLocked}
              />
            ) : (
              <div className="flex flex-col items-center justify-center aspect-square rounded-3xl bg-slate-50/50 border border-dashed border-slate-200 p-6 text-center max-w-[480px] mx-auto w-full">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5 shadow-sm shadow-blue-100/30">
                  <QrCode className="w-8 h-8" />
                </div>
                <h3 className="text-md font-bold text-slate-800 mb-2">Scanner inactif</h3>
                <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed mb-6">
                  Appuyez sur le bouton ci-dessous pour démarrer le scanner de billets en temps réel.
                </p>
                <button
                  onClick={() => setIsScanningActive(true)}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition active:scale-95 shadow-md shadow-blue-600/15 flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scanner le QR code</span>
                </button>
              </div>
            )}
          </div>

          {/* Session Counter Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 md:p-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  Tickets validés (Session)
                </h3>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{sessionCount}</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                setSessionCount(0);
                sessionStorage.removeItem("scanSessionCount");
              }}
              className="text-xs font-semibold text-slate-400 hover:text-red-500 transition cursor-pointer underline underline-offset-4"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Right Column: Status & Real-Time Logs */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Main Status Display Area */}
          <div className="flex-grow bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-center min-h-[360px]">
            
            {/* IDLE STATE */}
            {validationState === "idle" && (
              <div className="text-center py-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6 pulse-indicator shadow-sm shadow-blue-100/30">
                  <Clock className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Prêt à scanner</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Présentez le QR code d'un étudiant devant la caméra pour valider instantanément son accès au restaurant.
                </p>
              </div>
            )}

            {/* LOADING STATE */}
            {validationState === "loading" && (
              <div className="text-center py-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Vérification du ticket...</h3>
                <p className="text-sm text-slate-500">
                  Interrogation du système central...
                </p>
              </div>
            )}

            {/* SUCCESS STATE */}
            {validationState === "success" && studentInfo && (
              <div className="flex flex-col h-full justify-between animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600 animate-bounce" />
                    <span className="text-md font-bold uppercase tracking-wider text-emerald-600">
                      Ticket Validé
                    </span>
                  </div>
                  <span className="text-xs bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full font-bold">
                    SUCCÈS
                  </span>
                </div>

                {/* Student Ticket Card Detail */}
                <div className="bg-gradient-to-br from-emerald-50/50 via-white to-white border border-emerald-200/80 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-5 items-center md:items-start text-center md:text-left shadow-sm">
                  {/* Initials Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-xl font-extrabold text-emerald-700 shrink-0 uppercase shadow-sm shadow-emerald-100">
                    {studentInfo.prenom?.charAt(0) || ""}{studentInfo.nom?.charAt(0) || "E"}
                  </div>
                  
                  <div className="flex-grow space-y-1 w-full">
                    <span className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                      Identité de l'étudiant
                    </span>
                    <h4 className="text-xl font-black text-slate-800">
                      {studentInfo.prenom} {studentInfo.nom}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Code Apogée</p>
                        <p className="text-sm font-mono font-bold text-slate-700 mt-0.5">{studentInfo.apogee}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Service Validé</p>
                        <p className="text-sm font-bold text-blue-600 mt-0.5">
                          {serviceInfo?.type_repas || "Repas"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action / Reset progress indicator */}
                <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <p className="text-slate-400 text-xs flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Prêt dans quelques secondes...</span>
                  </p>
                  
                  <button
                    onClick={handleReset}
                    className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition active:scale-95 shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    Scan suivant
                  </button>
                </div>
              </div>
            )}

            {/* ERROR STATE */}
            {validationState === "error" && (
              <div className="flex flex-col h-full justify-between animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-7 h-7 text-red-600" />
                    <span className="text-md font-bold uppercase tracking-wider text-red-600">
                      Ticket Refusé
                    </span>
                  </div>
                  <span className="text-xs bg-red-100 border border-red-200 text-red-800 px-3 py-1 rounded-full font-bold">
                    REJETÉ
                  </span>
                </div>

                {/* Error Box Detail */}
                <div className="space-y-4">
                  {studentInfo && (
                    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-top-3 duration-200">
                      <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 text-red-700 flex items-center justify-center font-black uppercase shrink-0">
                        {studentInfo.prenom?.charAt(0) || ""}{studentInfo.nom?.charAt(0) || "E"}
                      </div>
                      <div className="text-left">
                        <span className="text-slate-400 text-[9px] uppercase tracking-widest font-bold">Étudiant</span>
                        <h4 className="text-sm font-bold text-slate-800 leading-tight">
                          {studentInfo.prenom} {studentInfo.nom}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">Apogée : {studentInfo.apogee}</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-red-50/50 via-white to-white border border-red-200/80 rounded-2xl p-5 flex flex-col items-center text-center justify-center min-h-[100px] shadow-sm">
                    <span className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1.5">
                      Raison de l'échec
                    </span>
                    <p className="text-sm font-extrabold text-red-650 leading-relaxed max-w-md">
                      {errorMsg}
                    </p>
                  </div>
                </div>

                {/* Action / Reset progress indicator */}
                <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <p className="text-slate-400 text-xs flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Retour au scan auto dans 4s...</span>
                  </p>
                  
                  <button
                    onClick={handleReset}
                    className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition active:scale-95 shadow-md shadow-red-600/10 cursor-pointer"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Quick Real-Time History Logs */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Historique récent de la session
            </h3>

            {scanHistory.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Aucun scan effectué dans cette session.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {scanHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/55 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          item.status === "success" ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {item.prenom} {item.nom}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Apogée: {item.apogee} | {item.service}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[10px] font-semibold text-slate-400">{item.time}</span>
                      {item.status === "error" && (
                        <span className="text-[9px] text-red-500 font-bold mt-0.5 max-w-[150px] truncate" title={item.reason}>
                          {item.reason}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default ScanDashboard;
