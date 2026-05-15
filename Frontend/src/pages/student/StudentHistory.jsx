import { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle,
  Clock,
  History,
  Loader2,
  Trash2,
  Utensils,
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

  const handleCancelReservation = async (reservationId) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment annuler cette réservation ?"
    );

    if (!confirmed) return;

    try {
      setCancelLoadingId(reservationId);
      setError("");
      setSuccessMessage("");

      await cancelReservation(reservationId);

      setSuccessMessage("Réservation annulée avec succès.");
      await fetchReservations();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Impossible d'annuler cette réservation."
      );
    } finally {
      setCancelLoadingId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "RESERVEE":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "VALIDEE":
        return "bg-green-100 text-green-700 border-green-200";
      case "ANNULEE":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "RESERVEE":
        return <Clock size={16} />;
      case "VALIDEE":
        return <CheckCircle size={16} />;
      case "ANNULEE":
        return <XCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const canCancel = (reservation) => {
    return reservation?.statut === "RESERVEE";
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Historique des réservations
        </h1>
        <p className="mt-3 text-slate-600">
          Consultez vos réservations passées et futures.
        </p>
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

      {loading && (
        <div className="grid gap-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl bg-white shadow-sm"
            />
          ))}
        </div>
      )}

      {!loading && reservations.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <History size={30} />
          </div>

          <h2 className="text-lg font-semibold text-slate-800">
            Aucune réservation trouvée
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Vos réservations apparaîtront ici après confirmation.
          </p>
        </div>
      )}

      {!loading && reservations.length > 0 && (
        <div className="grid gap-4">
          {reservations.map((reservation) => (
            <div
              key={reservation.id_reservation}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-blue-600">
                    <Utensils size={22} />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {reservation.type_repas || "Service"}
                    </h3>

                    <div className="mt-2 flex flex-col gap-2 text-sm text-slate-500 md:flex-row md:items-center md:gap-5">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={16} />
                        <span>{formatDate(reservation.date_repas)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>
                          {reservation.heure_debut} - {reservation.heure_fin}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:items-end">
                  <div
                    className={`flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${getStatusStyle(
                      reservation.statut
                    )}`}
                  >
                    {getStatusIcon(reservation.statut)}
                    <span>{reservation.statut}</span>
                  </div>

                  {canCancel(reservation) && (
                    <button
                      type="button"
                      onClick={() =>
                        handleCancelReservation(reservation.id_reservation)
                      }
                      disabled={cancelLoadingId === reservation.id_reservation}
                      className="flex w-fit items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {cancelLoadingId === reservation.id_reservation ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default StudentHistory;