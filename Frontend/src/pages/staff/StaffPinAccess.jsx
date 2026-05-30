import { useState } from "react";
import { ShieldCheck, Delete, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { verifyStaffPin } from "../../api/staffApi";
import logoRU from "../../assets/logo-ru.png";

const StaffPinAccess = () => {
  const navigate = useNavigate();

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNumberClick = (number) => {
    if (pin.length < 6) {
      setPin((prev) => prev + number);
      setError("");
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  };

  const handleSubmit = async () => {
    if (!pin) {
      setError("Veuillez saisir le code PIN.");
      return;
    }

    if (!/^\d+$/.test(pin)) {
      setError("Le code PIN doit contenir uniquement des chiffres.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await verifyStaffPin(pin);

      sessionStorage.setItem("staffPin", pin);
      navigate("/staff/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Code PIN invalide. Accès refusé."
      );
    } finally {
      setLoading(false);
    }
  };

  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <>
      <style>
        {`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes floatBlob {
            0%, 100% {
              transform: translateY(0px) translateX(0px) scale(1);
            }
            50% {
              transform: translateY(-28px) translateX(18px) scale(1.08);
            }
          }

          .animated-login-bg {
            background: linear-gradient(
              120deg,
              #eff6ff,
              #ffffff,
              #f0fdf4,
              #e0f2fe,
              #ffffff
            );
            background-size: 400% 400%;
            animation: gradientMove 14s ease infinite;
          }

          .blob {
            position: absolute;
            border-radius: 9999px;
            filter: blur(70px);
            opacity: 0.55;
            animation: floatBlob 9s ease-in-out infinite;
          }

          .blob-blue {
            width: 360px;
            height: 360px;
            background: #bfdbfe;
            top: -120px;
            left: -90px;
          }

          .blob-green {
            width: 330px;
            height: 330px;
            background: #bbf7d0;
            right: -100px;
            bottom: -90px;
            animation-delay: 2s;
          }

          .blob-cyan {
            width: 260px;
            height: 260px;
            background: #bae6fd;
            left: 55%;
            top: 18%;
            animation-delay: 4s;
          }

          .soft-grid {
            background-image:
              linear-gradient(rgba(37, 99, 235, 0.045) 1px, transparent 1px),
              linear-gradient(90deg, rgba(37, 99, 235, 0.045) 1px, transparent 1px);
            background-size: 42px 42px;
            mask-image: radial-gradient(circle at center, black, transparent 72%);
          }

          .login-card {
            box-shadow:
              0 24px 70px rgba(15, 23, 42, 0.12),
              0 8px 24px rgba(37, 99, 235, 0.06);
          }

          .title-gradient {
            background: linear-gradient(90deg, #0f172a, #1d4ed8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        `}
      </style>

      <div className="relative min-h-screen overflow-hidden animated-login-bg flex flex-col items-center justify-center px-4">
        <div className="blob blob-blue" />
        <div className="blob blob-green" />
        <div className="blob blob-cyan" />
        <div className="absolute inset-0 soft-grid" />

        <div className="relative z-10 flex flex-col items-center mb-7">
          <img
            src={logoRU}
            alt="Restaurant Universitaire"
            className="w-24 h-24 md:w-28 md:h-28 object-contain drop-shadow-xl mb-4"
          />

          <h1 className="text-3xl md:text-5xl font-bold title-gradient tracking-tight text-center">
            Accès Personnel RU
          </h1>

          <p className="text-slate-500 mt-3 text-base md:text-lg text-center">
            Interface sécurisée de validation des tickets
          </p>
        </div>

        <div className="relative z-10 bg-white/85 backdrop-blur-xl w-full max-w-sm rounded-3xl login-card px-7 py-8 border border-white/70">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-blue-700" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 text-center">
            Code PIN personnel
          </h2>

          <p className="text-sm text-slate-500 text-center mt-2 mb-6">
            Entrez le code PIN pour accéder au scanner QR.
          </p>

          <div className="flex items-center justify-center gap-2 mb-5">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border transition ${
                  pin[index]
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-slate-300"
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mb-5">
            {numbers.map((number) => (
              <button
                key={number}
                type="button"
                onClick={() => handleNumberClick(number)}
                className="h-14 rounded-xl bg-white/90 border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-xl font-semibold text-slate-800 transition active:scale-[0.96]"
              >
                {number}
              </button>
            ))}

            <button
              type="button"
              onClick={handleDelete}
              className="h-14 rounded-xl bg-white/90 border border-slate-200 hover:border-red-400 hover:bg-red-50 flex items-center justify-center transition active:scale-[0.96]"
            >
              <Delete className="w-5 h-5 text-slate-500" />
            </button>

            <button
              type="button"
              onClick={() => handleNumberClick("0")}
              className="h-14 rounded-xl bg-white/90 border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-xl font-semibold text-slate-800 transition active:scale-[0.96]"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="h-14 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white flex items-center justify-center shadow-lg shadow-blue-600/25 transition active:scale-[0.96]"
            >
              <LockKeyhole className="w-5 h-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-xl font-semibold text-lg shadow-lg shadow-emerald-600/25 transition active:scale-[0.98]"
          >
            {loading ? "Vérification..." : "Valider l’accès"}
          </button>
        </div>

        <p className="relative z-10 mt-7 text-slate-500 text-center">
          Réservé uniquement au personnel du restaurant universitaire
        </p>
      </div>
    </>
  );
};

export default StaffPinAccess;