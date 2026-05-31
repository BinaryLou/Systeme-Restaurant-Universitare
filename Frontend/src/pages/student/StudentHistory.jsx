import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  AlertCircle,
  AlertTriangle,
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
  const [activeTab, setActiveTab] = useState("Toutes");
  const [visibleCount, setVisibleCount] = useState(2);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);

      const data = await getMyReservations();
      setReservations(data?.items || []);
    } catch (err) {
      if (err.status !== 404) {
        toast.error(
          err.message ||
            "Impossible de charger l'historique des réservations."
        );
      }
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

      await cancelReservation(selectedReservationId);

      toast.success("Réservation annulée avec succès.");
      await fetchReservations();
      setShowCancelModal(false);
      setSelectedReservationId(null);
    } catch (err) {
      toast.error(
        err.message ||
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

  const checkIsExpired = (reservation) => {
    if (reservation.statut !== "RESERVEE") return false;
    
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const resDate = new Date(reservation.date_repas);
    resDate.setHours(0, 0, 0, 0);
    
    if (resDate < today) return true;
    
    if (resDate.getTime() === today.getTime() && reservation.heure_fin) {
      const [endHour, endMin] = reservation.heure_fin.split(':').map(Number);
      const endTime = new Date();
      endTime.setHours(endHour, endMin, 0, 0);
      
      if (now > endTime) return true;
    }
    
    return false;
  };

  const processedReservations = reservations.map(res => ({
    ...res,
    isExpired: checkIsExpired(res)
  }));

  const filteredReservations = processedReservations.filter((res) => {
    if (activeTab === "Toutes") return true;
    if (activeTab === "À venir") return res.statut === "RESERVEE" && !res.isExpired;
    if (activeTab === "Passées") return res.statut !== "RESERVEE" || res.isExpired;
    return true;
  });

  const statsUpcoming = processedReservations.filter(r => r.statut === "RESERVEE" && !r.isExpired).length;
  const statsExpired = processedReservations.filter(r => r.isExpired).length;
  const statsCanceled = processedReservations.filter(r => r.statut === "ANNULEE").length;
  const statsUsed = processedReservations.filter(r => r.statut !== "RESERVEE" && r.statut !== "ANNULEE" && !r.isExpired).length;

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
    <section className="mx-auto max-w-4xl space-y-6 pb-12 px-3 sm:px-4 animate-page-fade">
      {/* HEADER HERO */}
      <div className="rounded-[18px] bg-[#1d4fed] px-5 py-6 sm:px-8 sm:py-8 text-white shadow-xl shadow-blue-900/20 flex items-center gap-4 sm:gap-5">
        <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shrink-0">
          <HistoryIcon className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Historique des réservations
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-100">
            Consultez et gérez vos réservations
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex w-fit rounded-xl bg-white p-1 border border-slate-200">
        {["Toutes", "À venir", "Passées"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setVisibleCount(2);
            }}
            className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
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
        <div className="relative mt-8">
          <div className="flex flex-col">
            {filteredReservations.slice(0, visibleCount).map((reservation, index) => {
              const isExpired = reservation.isExpired;
            const isUpcoming = reservation.statut === "RESERVEE" && !isExpired;
            const isCanceled = reservation.statut === "ANNULEE";
            const isUsed = reservation.statut !== "RESERVEE" && reservation.statut !== "ANNULEE" && !isExpired;
            const isLunch = reservation.type_repas?.toUpperCase().includes("DEJEUNER") || reservation.id_service === 1;
            const menuItems = reservation.menu || getMenuForMeal(reservation.type_repas);
            
            return (
              <div key={reservation.id_reservation} className="flex gap-2 sm:gap-6 md:gap-8 relative min-h-[140px]">
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
                      ${isUpcoming ? 'bg-[#1d4fed]' : isCanceled ? 'bg-[#ef4444]' : isExpired ? 'bg-[#f59e0b]' : 'bg-[#08b94e]'}
                    `}
                  >
                    {isUpcoming ? <Clock size={16} strokeWidth={2.5} /> : isCanceled ? <X size={16} strokeWidth={2.5} /> : isExpired ? <AlertTriangle size={16} strokeWidth={2.5} /> : <Check size={16} strokeWidth={2.5} />}
                  </div>

                  {/* Ligne connectrice */}
                  {index !== filteredReservations.length - 1 && (
                    <div 
                      className={`w-[2px] flex-1 mt-2 min-h-[40px] ${isUpcoming ? 'bg-blue-200' : isCanceled ? 'bg-red-200' : isExpired ? 'bg-amber-200' : 'bg-green-200'}`} 
                    />
                  )}
                </div>

                {/* Carte Réservation */}
                <div className="flex-1 pb-8">
                  <div 
                    className={`rounded-2xl border bg-white p-4 sm:p-6 shadow-sm transition-shadow hover:shadow-md
                      ${isUpcoming ? 'border-blue-200' : isCanceled ? 'border-red-200' : isExpired ? 'border-amber-200' : 'border-green-200'}
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
                            ${isUpcoming ? 'bg-blue-50 text-[#1d4fed] border-blue-200' : isCanceled ? 'bg-red-50 text-[#ef4444] border-red-200' : isExpired ? 'bg-amber-50 text-[#f59e0b] border-amber-200' : 'bg-green-50 text-[#08b94e] border-green-200'}
                          `}
                        >
                          {isUpcoming ? <Clock size={14} /> : isCanceled ? <X size={14} /> : isExpired ? <AlertTriangle size={14} /> : <Check size={14} />}
                          <span>{isUpcoming ? "À venir" : isCanceled ? "Annulé" : isExpired ? "Expiré" : "Utilisé"}</span>
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
          
          {filteredReservations.length > visibleCount && (
            <div className="relative flex justify-center mt-2 pt-6">
              <div className="absolute bottom-full left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
              <button
                onClick={() => setVisibleCount((prev) => prev + 2)}
                className="relative z-10 px-8 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-bold hover:text-blue-600 hover:border-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-md"
              >
                Afficher plus
              </button>
            </div>
          )}
        </div>
      )}

      {/* STATISTIQUES SECTION */}
      {!loading && (
        <div className="mt-8 rounded-[20px] bg-white border border-slate-200 p-4 sm:p-8 shadow-sm">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
            Statistiques
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:divide-x divide-y md:divide-y-0 divide-slate-100">
            {/* À venir */}
            <div className="flex flex-col items-center py-2 md:py-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#1d4fed] mb-4">
                <Clock size={24} />
              </div>
              <span className="text-3xl font-black text-[#1d4fed] mb-1">{statsUpcoming}</span>
              <span className="text-sm font-semibold text-slate-500">À venir</span>
            </div>

            {/* Utilisées */}
            <div className="flex flex-col items-center py-2 md:py-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-[#08b94e] mb-4">
                <Check size={24} />
              </div>
              <span className="text-3xl font-black text-[#08b94e] mb-1">{statsUsed}</span>
              <span className="text-sm font-semibold text-slate-500">Utilisées</span>
            </div>

            {/* Expirées */}
            <div className="flex flex-col items-center py-2 md:py-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-[#f59e0b] mb-4">
                <AlertTriangle size={24} />
              </div>
              <span className="text-3xl font-black text-[#f59e0b] mb-1">{statsExpired}</span>
              <span className="text-sm font-semibold text-slate-500">Expirées</span>
            </div>

            {/* Annulées */}
            <div className="flex flex-col items-center py-2 md:py-0">
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