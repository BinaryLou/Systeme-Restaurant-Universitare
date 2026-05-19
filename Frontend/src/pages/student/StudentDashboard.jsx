import { useState, useEffect } from "react";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  History,
  QrCode,
  Utensils,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getMenuByDate } from "../../services/menuApi";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const savedAuth = JSON.parse(localStorage.getItem("ru_auth") || "null");
  const student = user || savedAuth?.user || JSON.parse(localStorage.getItem("user") || "null");

  const firstName = student?.prenom || "Mohammed";
  const lastName = student?.nom || "ALAMI";
  const apogee = student?.apogee || "20220001";
  const solde = student?.solde ?? 600;

  const [loadingMenu, setLoadingMenu] = useState(true);
  const [hasMenu, setHasMenu] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoadingMenu(true);
        const today = new Date().toISOString().split("T")[0];
        // Fetch the menu for today
        await getMenuByDate(today);
        setHasMenu(true);
      } catch (err) {
        if (err.status !== 404) {
          toast.error("Impossible de charger le menu du jour.");
        }
        setHasMenu(false);
      } finally {
        setLoadingMenu(false);
      }
    };
    fetchMenu();
  }, []);

  const todayStr = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 lg:px-8 lg:py-8">
      {/* HERO */}
      <section className="rounded-[18px] bg-[#1d4fed] px-6 py-8 lg:px-12 lg:py-10 text-white shadow-xl shadow-blue-900/20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-6">
          <div>
            <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">
              Tableau de bord étudiant
            </p>

            <h1 className="mt-3 lg:mt-4 text-4xl lg:text-5xl font-bold tracking-tight">
              Bienvenue, {firstName} !
            </h1>

            <p className="mt-3 lg:mt-5 text-sm lg:text-lg text-blue-100">
              Gérez vos réservations de repas en quelques clics
            </p>
          </div>

          <div className="flex w-full lg:w-auto lg:min-w-[300px] items-center gap-4 lg:gap-5 rounded-2xl border border-white/20 bg-white/15 px-5 py-5 lg:px-7 lg:py-6 backdrop-blur">
            <div className="flex h-12 w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Wallet className="h-6 w-6 lg:h-[30px] lg:w-[30px]" />
            </div>

            <div>
              <p className="text-[10px] lg:text-xs font-medium uppercase tracking-widest text-blue-100">
                Solde disponible
              </p>
              <p className="mt-1 lg:mt-2 text-3xl lg:text-4xl font-bold">{solde} DH</p>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIONS */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-slate-900">Actions rapides</h2>
        <p className="mt-1 text-sm text-slate-500">
          Accédez à vos services en un clic
        </p>

        <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Réserver */}
          <button
            onClick={() => navigate("/student/reserver")}
            className="group rounded-2xl bg-[#08b94e] p-7 text-left text-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                <CalendarDays size={28} />
              </div>

              <span className="rounded-lg bg-white/20 px-4 py-2 text-xs font-semibold">
                Principal
              </span>
            </div>

            <h3 className="mt-7 text-2xl font-bold">Réserver un repas</h3>
            <p className="mt-3 text-sm text-green-50">
              Planifiez vos repas jusqu'à 30 jours à l'avance
            </p>

            <div className="mt-8 flex items-center gap-2 text-sm font-bold">
              Accéder maintenant
              <ChevronRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </div>
          </button>

          {/* QR */}
          <button
            onClick={() => navigate("/student/qrcode")}
            className="group rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-[#1d4fed]">
              <QrCode size={28} />
            </div>

            <h3 className="mt-7 text-2xl font-bold text-slate-900">
              Mon QR Code
            </h3>
            <p className="mt-3 text-sm text-slate-500">
              Accédez à votre code personnel
            </p>

            <div className="mt-8 flex items-center gap-1 text-sm font-bold text-[#1d4fed]">
              Voir
              <ChevronRight
                size={17}
                className="transition group-hover:translate-x-1"
              />
            </div>
          </button>

          {/* Historique */}
          <button
            onClick={() => navigate("/student/historique")}
            className="group rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
              <History size={28} />
            </div>

            <h3 className="mt-7 text-2xl font-bold text-slate-900">
              Historique
            </h3>
            <p className="mt-3 text-sm text-slate-500">
              Consultez vos réservations
            </p>

            <div className="mt-8 flex items-center gap-1 text-sm font-bold text-slate-700">
              Consulter
              <ChevronRight
                size={17}
                className="transition group-hover:translate-x-1"
              />
            </div>
          </button>
        </div>
      </section>

      {/* MENU DU JOUR */}
      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-[#08b94e]">
            <Utensils size={28} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">Menu du jour</h2>
            <p className="text-sm text-slate-500 capitalize">{todayStr}</p>
          </div>
        </div>

        {loadingMenu ? (
          <div className="mt-8 flex items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : !hasMenu ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-slate-500">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Utensils size={32} />
            </div>
            <p className="text-lg font-bold text-slate-800">Aucun menu programmé</p>
            <p className="mt-1 text-sm text-slate-500">Le menu du jour n'est pas encore disponible.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Déjeuner */}
          <div>
            <div
              className="relative h-40 overflow-hidden rounded-xl bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=80')",
              }}
            >
              <div className="absolute inset-0 bg-black/35" />

              <div className="absolute bottom-5 left-5 flex items-center gap-2 text-white">
                <span className="h-3 w-3 rounded-full bg-[#08b94e]" />
                <span className="font-bold">Déjeuner</span>
              </div>

              <div className="absolute bottom-4 right-4 rounded-lg bg-black/40 px-4 py-2 text-sm font-semibold text-white">
                11:00 - 14:30
              </div>
            </div>

            <ul className="mt-5 space-y-4 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="text-[#08b94e]">•</span> Soupe de légumes
              </li>
              <li className="flex gap-3">
                <span className="text-[#08b94e]">•</span> Tajine de poulet
              </li>
              <li className="flex gap-3">
                <span className="text-[#08b94e]">•</span> Salade verte
              </li>
              <li className="flex gap-3">
                <span className="text-[#08b94e]">•</span> Fruits de saison
              </li>
            </ul>
          </div>

          {/* Dîner */}
          <div>
            <div
              className="relative h-40 overflow-hidden rounded-xl bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=80')",
              }}
            >
              <div className="absolute inset-0 bg-black/35" />

              <div className="absolute bottom-5 left-5 flex items-center gap-2 text-white">
                <span className="h-3 w-3 rounded-full bg-[#3b82f6]" />
                <span className="font-bold">Dîner</span>
              </div>

              <div className="absolute bottom-4 right-4 rounded-lg bg-black/40 px-4 py-2 text-sm font-semibold text-white">
                17:00 - 20:00
              </div>
            </div>

            <ul className="mt-5 space-y-4 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="text-[#3b82f6]">•</span> Salade marocaine
              </li>
              <li className="flex gap-3">
                <span className="text-[#3b82f6]">•</span> Poisson grillé
              </li>
              <li className="flex gap-3">
                <span className="text-[#3b82f6]">•</span> Riz
              </li>
              <li className="flex gap-3">
                <span className="text-[#3b82f6]">•</span> Yaourt
              </li>
            </ul>
          </div>
        </div>
        )}
      </section>
    </div>
  );
};

export default StudentDashboard;
