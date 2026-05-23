import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, RefreshCw, AlertTriangle } from "lucide-react";

const QRScanner = ({ onScanSuccess, onScanError, paused = false }) => {
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const pausedRef = useRef(paused);

  const [hasPermission, setHasPermission] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [activeCameraIndex, setActiveCameraIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Sync paused state to ref to avoid restarting scanner on change
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  // Initialize camera and start scanner
  useEffect(() => {
    const initializeScanner = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        // Request camera permissions and get list
        const devices = await Html5Qrcode.getCameras();
        
        if (!devices || devices.length === 0) {
          setHasPermission(false);
          setErrorMessage("Aucune caméra détectée sur ce périphérique.");
          setIsLoading(false);
          return;
        }

        setCameras(devices);
        setHasPermission(true);
        
        // Start scanner with first camera (usually back camera on mobile or default webcam)
        // We look for a back camera first if available
        let defaultIndex = 0;
        const backCameraIndex = devices.findIndex((device) =>
          device.label.toLowerCase().includes("back") ||
          device.label.toLowerCase().includes("arrière") ||
          device.label.toLowerCase().includes("environment")
        );
        if (backCameraIndex !== -1) {
          defaultIndex = backCameraIndex;
        }
        setActiveCameraIndex(defaultIndex);

        await startScanning(devices[defaultIndex].id);
      } catch (err) {
        console.error("Erreur d'initialisation caméra :", err);
        setHasPermission(false);
        setErrorMessage(
          "Accès caméra refusé. Veuillez autoriser l'accès à la caméra dans votre navigateur pour scanner."
        );
        setIsLoading(false);
      }
    };

    initializeScanner();
  }, []);

  const startScanning = async (cameraId) => {
    setIsLoading(true);
    
    // Stop existing scanner if running
    await stopScanner();

    // Create new scanner instance
    const html5QrCode = new Html5Qrcode("qr-reader-container");
    html5QrCodeRef.current = html5QrCode;

    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
      // If paused, ignore the scan
      if (pausedRef.current) return;
      
      if (onScanSuccess) {
        onScanSuccess(decodedText, decodedResult);
      }
    };

    const qrCodeErrorCallback = (errorMessage) => {
      // Log errors but do not crash (very common when frame has no QR code)
      if (onScanError && !pausedRef.current) {
        onScanError(errorMessage);
      }
    };

    // Calculate qrbox dynamically based on width - Enlarged for S12-01 request!
    const qrboxFunction = (viewfinderWidth, viewfinderHeight) => {
      const minEdgePercentage = 0.8; // 80% of the shortest edge
      const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
      const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
      
      return {
        width: Math.max(260, Math.min(qrboxSize, 340)),
        height: Math.max(260, Math.min(qrboxSize, 340)),
      };
    };

    try {
      await html5QrCode.start(
        cameraId,
        {
          fps: 15,
          aspectRatio: 1.0,
          // We omit qrbox to prevent the library from drawing its own canvas overlay,
          // so only our custom blue CSS viewfinder is visible.
        },
        qrCodeSuccessCallback,
        qrCodeErrorCallback
      );
      setIsLoading(false);
    } catch (err) {
      console.error("Erreur de démarrage du scan :", err);
      setErrorMessage("Impossible de démarrer le flux vidéo de cette caméra.");
      setIsLoading(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error("Erreur d'arrêt du scanner :", err);
      }
      html5QrCodeRef.current = null;
    }
  };

  const handleSwitchCamera = async () => {
    if (cameras.length <= 1) return;
    
    const nextIndex = (activeCameraIndex + 1) % cameras.length;
    setActiveCameraIndex(nextIndex);
    await startScanning(cameras[nextIndex].id);
  };

  return (
    <>
      <style>
        {`
          @keyframes scanLine {
            0% { top: 0%; }
            50% { top: 100%; }
            100% { top: 0%; }
          }
          .laser-line {
            animation: scanLine 3s linear infinite;
            box-shadow: 0 0 10px 3px rgba(37, 99, 235, 0.85);
          }
          .custom-scanner-mask {
            background: rgba(248, 250, 252, 0.62);
            backdrop-filter: blur(1.5px);
          }
          .viewfinder-row {
            height: 250px;
          }
          .viewfinder-box {
            width: 250px;
            height: 250px;
          }
          @media (min-width: 380px) {
            .viewfinder-row {
              height: 300px;
            }
            .viewfinder-box {
              width: 300px;
              height: 300px;
            }
          }
          @media (min-width: 440px) {
            .viewfinder-row {
              height: 340px;
            }
            .viewfinder-box {
              width: 340px;
              height: 340px;
            }
          }
          #qr-reader-container video {
            object-fit: cover !important;
            width: 100% !important;
            height: 100% !important;
            border-radius: 1.5rem;
          }
        `}
      </style>

      <div className="flex flex-col items-center gap-3 w-full">
        {/* Enlarged Container: max-w-[480px] with white borders and shadow */}
        <div className="relative w-full max-w-[480px] mx-auto aspect-square rounded-3xl bg-white overflow-hidden shadow-lg border border-slate-200/80">
          
          {/* Camera Feed Container */}
          <div id="qr-reader-container" className="w-full h-full rounded-3xl overflow-hidden" ref={scannerRef}></div>

          {/* Custom Frosted White Overlay */}
          {hasPermission && !isLoading && !errorMessage && (
            <div className="absolute inset-0 pointer-events-none">
              {/* 3x3 Grid Mask for mathematical centering */}
              <div className="w-full h-full grid grid-rows-[1fr_auto_1fr] grid-cols-[1fr_auto_1fr]">
                {/* Row 1 (Top Mask) */}
                <div className="custom-scanner-mask col-span-3"></div>

                {/* Row 2 (Middle Viewport Row) */}
                <div className="custom-scanner-mask"></div> {/* Left Mask */}

                <div className="relative viewfinder-box shrink-0 pointer-events-auto">
                  {/* 4 Corner Markers (Blue) */}
                  <div className="absolute top-0 left-0 w-9 h-9 border-t-4 border-l-4 border-blue-600 rounded-tl-xl"></div>
                  <div className="absolute top-0 right-0 w-9 h-9 border-t-4 border-r-4 border-blue-600 rounded-tr-xl"></div>
                  <div className="absolute bottom-0 left-0 w-9 h-9 border-b-4 border-l-4 border-blue-600 rounded-bl-xl"></div>
                  <div className="absolute bottom-0 right-0 w-9 h-9 border-b-4 border-r-4 border-blue-600 rounded-br-xl"></div>

                  {/* Laser Scanning Line */}
                  {!paused && (
                    <div className="absolute left-0 w-full h-1 bg-blue-600 opacity-90 laser-line"></div>
                  )}
                  
                  {paused && (
                    <div className="absolute inset-0 bg-blue-600/5 flex items-center justify-center backdrop-blur-[1px]">
                      <div className="w-14 h-14 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                    </div>
                  )}
                </div>

                <div className="custom-scanner-mask"></div> {/* Right Mask */}

                {/* Row 3 (Bottom Mask) */}
                <div className="custom-scanner-mask col-span-3"></div>
              </div>

              {/* Floating Top Badge */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center justify-center">
                <span className="text-slate-800 font-extrabold text-xs px-4.5 py-2 bg-white/95 backdrop-blur-md rounded-full border border-slate-200 shadow-sm">
                  {paused ? "Traitement..." : "Recherche de QR code..."}
                </span>
              </div>
            </div>
          )}

          {/* Switch Camera Button (Light Theme) */}
          {hasPermission && cameras.length > 1 && !isLoading && (
            <button
              onClick={handleSwitchCamera}
              className="absolute bottom-4 right-4 p-3 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 backdrop-blur-md rounded-2xl border border-slate-200 shadow-md transition cursor-pointer z-10"
              title="Changer de caméra"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}

          {/* Loading Spinner (White Background) */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white text-slate-800 p-6">
              <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mb-4"></div>
              <p className="text-sm font-bold text-slate-600">Activation de la caméra...</p>
            </div>
          )}

          {/* Access Denied or Error Message (White Background) */}
          {hasPermission === false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white text-slate-800 p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5 text-red-600 shadow-sm">
                <CameraOff className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2">Accès Caméra Impossible</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                {errorMessage || "Veuillez autoriser l'accès à la caméra pour pouvoir scanner les tickets."}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/10 active:scale-95 transition"
              >
                Recharger la page
              </button>
            </div>
          )}

          {/* Non-permission initialization errors (White Background) */}
          {hasPermission && errorMessage && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white text-slate-800 p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-yellow-50 border border-yellow-100 flex items-center justify-center mb-5 text-yellow-600 shadow-sm">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2">Erreur Caméra</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                {errorMessage}
              </p>
              <button
                onClick={() => startScanning(cameras[activeCameraIndex]?.id)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/10 active:scale-95 transition"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>

        {/* Floating Bottom Instructions moved to outside, styled clearly below the scanner box */}
        {hasPermission && !isLoading && !errorMessage && (
          <p className="text-slate-500 text-xs font-semibold text-center mt-1.5 max-w-[280px] leading-relaxed">
            Centrez le QR code étudiant dans le cadre de ciblage.
          </p>
        )}
      </div>
    </>
  );
};

export default QRScanner;
