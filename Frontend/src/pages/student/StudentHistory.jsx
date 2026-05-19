import { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle,
  Clock,
  History as HistoryIcon,
  Loader2,
  Trash2,
  Utensils,
  X,
  XCircle,
} from "lucide-react";
import {
  cancelReservation,
  getMyReservations,
} from "../../services/reservationApi";

const StudentHistory = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("Toutes");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyReservations();
      setReservations(data?.items || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Impossible de charger l'historique des réservations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const confirmCancel = async () => {
    if (!selectedReservationId) return;

    try {
      setCancelLoadingId(selectedReservationId);
      setError("");
      setSuccessMessage("");

      await cancelReservation(selectedReservationId);

      setSuccessMessage("Réservation annulée avec succès.");
      await fetchReservations();
      setShowCancelModal(false);
      setSelectedReservationId(null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Impossible d'annuler cette réservation."
      );
    } finally {
      setCancelLoadingId(null);
    }
  };

  const promptCancel = (id) => {
    setSelectedReservationId(id);
    setShowCancelModal(true);
  };

  const filteredReservations = reservations.filter((res) => {
    if (activeTab === "Toutes") return true;
    if (activeTab === "À venir") return res.statut === "RESERVEE";
    if (activeTab === "Passées") return res.statut !== "RESERVEE";
    return true;
  });

  const statsUpcoming = reservations.filter(r => r.statut === "RESERVEE").length;
  const statsCanceled = reservations.filter(r => r.statut === "ANNULEE").length;
  const statsUsed = reservations.filter(r => r.statut !== "RESERVEE" && r.statut !== "ANNULEE").length;

  const formatWeekday = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", { weekday: "short" }) + ".";
  };

  const formatDay = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).getDate();
  };

  const formatMonth = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", { month: "short" }) + ".";
  };

  const getMenuForMeal = (type) => {
    if (type?.toUpperCase().includes("DINER") || type?.toUpperCase().includes("DÎNER")) {
      return ["Salade marocaine", "Poisson grillé", "Riz", "Yaourt"];
    }
    return ["Soupe de légumes", "Tajine de poulet", "Salade verte", "Fruits de saison"];
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* HEADER HERO */}
      <div className="rounded-[18px] bg-[#1d4fed] px-8 py-8 text-white shadow-xl shadow-blue-900/20 flex items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shrink-0">
          <HistoryIcon size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Historique des réservations
          </h1>
          <p className="mt-2 text-blue-100">
            Consultez et gérez vos réservations
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} />
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="flex w-fit rounded-xl bg-white p-1.5 shadow-sm border border-slate-200">
        {["Toutes", "À venir", "Passées"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab
                ? "bg-[#1d4fed] text-white shadow-md shadow-blue-600/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading && (
        <div className="grid gap-6 pl-20 pt-8">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-white shadow-sm border border-slate-100"
            />
          ))}
        </div>
      )}

      {!loading && filteredReservations.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm mt-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <HistoryIcon size={30} />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            Aucune réservation trouvée
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Vous n'avez pas de réservations dans cette catégorie.
          </p>
        </div>
      )}

      {!loading && filteredReservations.length > 0 && (
        <div className="flex flex-col mt-8">
          {filteredReservations.map((reservation, index) => {
            const isUpcoming = reservation.statut === "RESERVEE";
            const isCanceled = reservation.statut === "ANNULEE";
            const isLunch = reservation.type_repas?.toUpperCase().includes("DEJEUNER") || reservation.id_service === 1;
            const menuItems = reservation.menu || getMenuForMeal(reservation.type_repas);
            
            return (
              <div key={reservation.id_reservation} className="flex gap-4 sm:gap-8 relative min-h-[140px]">
                {/* Timeline gauche */}
                <div className="w-14 sm:w-16 flex flex-col items-center shrink-0 z-10 pt-2">
                  <span className="text-xs font-semibold text-slate-500 capitalize">
                    {formatWeekday(reservation.date_repas)}
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none my-1">
                    {formatDay(reservation.date_repas)}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 capitalize">
                    {formatMonth(reservation.date_repas)}
                  </span>
                  
                  <div 
                    className={`mt-4 flex items-center justify-center w-8 h-8 rounded-full shadow-sm text-white border-2 border-white
                      ${isUpcoming ? 'bg-[#1d4fed]' : isCanceled ? 'bg-[#ef4444]' : 'bg-[#08b94e]'}
                    `}
                  >
                    {isUpcoming ? <Clock size={16} strokeWidth={2.5} /> : isCanceled ? <X size={16} strokeWidth={2.5} /> : <Check size={16} strokeWidth={2.5} />}
                  </div>

                  {/* Ligne connectrice */}
                  {index !== filteredReservations.length - 1 && (
                    <div 
                      className={`w-[2px] flex-1 mt-2 min-h-[40px] ${isUpcoming ? 'bg-blue-200' : isCanceled ? 'bg-red-200' : 'bg-green-200'}`} 
                    />
                  )}
                </div>

                {/* Carte Réservation */}
                <div className="flex-1 pb-8">
                  <div 
                    className={`rounded-2xl border bg-white p-5 sm:p-6 shadow-sm transition-shadow hover:shadow-md
                      ${isUpcoming ? 'border-blue-200' : isCanceled ? 'border-red-200' : 'border-green-200'}
                    `}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0
                            ${isLunch ? 'bg-green-50 text-[#08b94e]' : 'bg-blue-50 text-[#1d4fed]'}
                          `}
                        >
                          <Utensils size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">
                            {reservation.type_repas || (isLunch ? "Déjeuner" : "Dîner")}
                          </h3>
                          <p className="text-sm text-slate-500 font-medium mt-0.5">
                            {reservation.heure_debut} - {reservation.heure_fin}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        {isUpcoming && (
                          <button
                            type="button"
                            onClick={() => promptCancel(reservation.id_reservation)}
                            disabled={cancelLoadingId === reservation.id_reservation}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title="Annuler la réservation"
                          >
                            {cancelLoadingId === reservation.id_reservation ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        )}
                        <div 
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold
                            ${isUpcoming ? 'bg-blue-50 text-[#1d4fed] border-blue-200' : isCanceled ? 'bg-red-50 text-[#ef4444] border-red-200' : 'bg-green-50 text-[#08b94e] border-green-200'}
                          `}
                        >
                          {isUpcoming ? <Clock size={14} /> : isCanceled ? <X size={14} /> : <Check size={14} />}
                          <span>{isUpcoming ? "Réservé" : isCanceled ? "Annulé" : "Utilisé"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">
                        Menu
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {menuItems.map((item, idx) => (
                          <span 
                            key={idx} 
                            className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-600 bg-white"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STATISTIQUES SECTION */}
      {!loading && (
        <div className="mt-8 rounded-[20px] bg-white border border-slate-200 p-8 shadow-sm">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
            Statistiques
          </p>
          <div className="grid grid-cols-3 gap-4 divide-x divide-slate-100">
            {/* À venir */}
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#1d4fed] mb-4">
                <Clock size={24} />
              </div>
              <span className="text-3xl font-black text-[#1d4fed] mb-1">{statsUpcoming}</span>
              <span className="text-sm font-semibold text-slate-500">À venir</span>
            </div>

            {/* Utilisées */}
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-[#08b94e] mb-4">
                <Check size={24} />
              </div>
              <span className="text-3xl font-black text-[#08b94e] mb-1">{statsUsed}</span>
              <span className="text-sm font-semibold text-slate-500">Utilisées</span>
            </div>

            {/* Annulées */}
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-[#ef4444] mb-4">
                <X size={24} />
              </div>
              <span className="text-3xl font-black text-[#ef4444] mb-1">{statsCanceled}</span>
              <span className="text-sm font-semibold text-slate-500">Annulées</span>
            </div>
          </div>
        </div>
      )}
      {/* CANCEL MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-2xl scale-in-95 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-14 h-14 mx-auto bg-red-100 rounded-full text-red-600 mb-5">
                <AlertCircle size={28} />
              </div>
              <h3 className="text-xl font-bold text-center text-slate-900">
                Annuler la réservation ?
              </h3>
              <p className="mt-2 text-center text-slate-500 font-medium leading-relaxed">
                Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.
              </p>
            </div>
            <div className="flex gap-3 p-5 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedReservationId(null);
                }}
                className="flex-1 px-4 py-3 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-sm"
              >
                Non, garder
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelLoadingId === selectedReservationId}
                className="flex items-center justify-center flex-1 gap-2 px-4 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition shadow-sm disabled:opacity-70"
              >
                {cancelLoadingId === selectedReservationId ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Oui, annuler"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default StudentHistory;