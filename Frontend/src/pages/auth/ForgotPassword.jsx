import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/authApi";
import logoRU from "../../assets/logo-ru.png";

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setIdentifier(e.target.value);
    setError("");
    setMessage("");
  };

  const validateIdentifier = (id) => {
    // Basic validation: could be an email or an Apogée number
    if (!id) return false;
    // Just ensure it's not purely whitespace for local validation
    return id.trim().length > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!validateIdentifier(identifier)) {
      setError("Veuillez saisir une adresse email ou un numéro Apogée valide.");
      return;
    }

    try {
      setLoading(true);
      // We pass the identifier to the authApi (could be email or apogee)
      // Based on standard implementation, we can pass it as 'email' field or 'identifier'
      // If authApi uses { email }, let's stick to { email: identifier }
      await forgotPassword(identifier);
      
      setMessage("Si votre compte existe, un email contenant les instructions de récupération vous a été envoyé.");
    } catch (err) {
      // It is often better not to reveal if an account exists or not, but we'll show generic error if needed
      setError(
        err.message ||
        "Une erreur est survenue lors de la demande de réinitialisation."
      );
    } finally {
      setLoading(false);
    }
  };

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
            0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
            50% { transform: translateY(-28px) translateX(18px) scale(1.08); }
          }
          .animated-login-bg {
            background: linear-gradient(120deg, #eff6ff, #ffffff, #f0fdf4, #e0f2fe, #ffffff);
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
          .blob-blue { width: 360px; height: 360px; background: #bfdbfe; top: -120px; left: -90px; }
          .blob-green { width: 330px; height: 330px; background: #bbf7d0; right: -100px; bottom: -90px; animation-delay: 2s; }
          .blob-cyan { width: 260px; height: 260px; background: #bae6fd; left: 55%; top: 18%; animation-delay: 4s; }
          .soft-grid {
            background-image: linear-gradient(rgba(37, 99, 235, 0.045) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(37, 99, 235, 0.045) 1px, transparent 1px);
            background-size: 42px 42px;
            mask-image: radial-gradient(circle at center, black, transparent 72%);
          }
          .login-card {
            box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12), 0 8px 24px rgba(37, 99, 235, 0.06);
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

        <div className="relative z-10 flex flex-col items-center mb-8">
          <div className="mb-5">
            <img
              src={logoRU}
              alt="Restaurant Universitaire"
              className="w-28 h-28 md:w-32 md:h-32 object-contain drop-shadow-xl"
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold title-gradient tracking-tight">
            Mot de passe oublié
          </h1>

          <p className="text-slate-500 mt-3 text-lg text-center max-w-md">
            Saisissez votre adresse email ou numéro Apogée pour recevoir les instructions de récupération.
          </p>
        </div>

        <div className="relative z-10 bg-white/85 backdrop-blur-xl w-full max-w-md rounded-3xl login-card px-8 py-8 border border-white/70">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email / Code Apogée
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={21}
                />

                <input
                  type="text"
                  name="identifier"
                  value={identifier}
                  onChange={handleChange}
                  placeholder="20220001 ou email@ensa.ma"
                  className="w-full h-14 pl-12 pr-4 bg-white/90 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-slate-700 transition"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}
            
            {message && (
              <div className="mb-4 bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-3 text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-600/25 transition active:scale-[0.98] mb-4"
            >
              {loading ? "Envoi en cours..." : "Récupérer le mot de passe"}
            </button>
            
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center text-slate-600 hover:text-blue-600 font-medium text-sm transition group"
              >
                <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={16} />
                Retour à la connexion
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
