import { Check } from "lucide-react";

const ReservationRecap = ({ reservation }) => {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-900/10">
      <div className="bg-[#1d4fed] px-6 py-6 text-white">
        <h2 className="text-2xl font-bold">Récapitulatif</h2>
        <p className="mt-1 text-sm text-blue-100">
          Vérifiez avant de confirmer
        </p>
      </div>

      <div className="p-6">

        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
          Dates sélectionnées
        </p>

        <div className="flex flex-wrap gap-2">
          {reservation.selectedDates.length === 0 ? (
            <span className="text-sm text-slate-400">Aucune date</span>
          ) : (
            reservation.selectedDates.map((dateKey) => (
              <span
                key={dateKey}
                className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-[#1d4fed]"
              >
                {reservation.formatDisplayDate(dateKey)}
              </span>
            ))
          )}
        </div>

        <div className="my-6 border-t border-slate-100" />

        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
          Services choisis
        </p>

        <div className="flex flex-wrap gap-2">
          {reservation.selectedServices.length === 0 ? (
            <span className="text-sm text-slate-400">Aucun service</span>
          ) : (
            reservation.selectedServices.map((serviceCode) => {
              const service = reservation.SERVICES.find(
                (item) => item.code === serviceCode
              );
              const isLunch = serviceCode === "DEJEUNER";

              return (
                <span
                  key={serviceCode}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                    isLunch
                      ? "border-green-200 bg-green-50 text-[#08b94e]"
                      : "border-blue-200 bg-blue-50 text-[#1d4fed]"
                  }`}
                >
                  ● {service.label}
                </span>
              );
            })
          )}
        </div>

        <div className="my-6 border-t border-slate-100" />

        <div className="space-y-4 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Nombre de repas</span>
            <strong className="text-slate-900">{reservation.totalMeals}</strong>
          </div>

          <div className="flex justify-between">
            <span>Prix par repas</span>
            <strong className="text-slate-900">
              {reservation.mealPrice} DH
            </strong>
          </div>
        </div>

        <div className="my-6 border-t border-slate-200" />

        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-900">Prix Total</span>
          <span className="text-4xl font-bold text-[#1d4fed]">
            {reservation.totalPrice.toFixed(1)} DH
          </span>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Solde actuel</span>
            <strong className="text-slate-900">
              {reservation.currentBalance} DH
            </strong>
          </div>

          <div className="mt-4 flex justify-between">
            <span className="font-bold text-slate-900">Après paiement</span>
            <strong className="text-2xl text-[#08b94e]">
              {reservation.afterPayment.toFixed(1)} DH
            </strong>
          </div>
        </div>

        <button
          onClick={reservation.handleConfirmReservation}
          disabled={
            reservation.confirmLoading ||
            reservation.selectedDates.length === 0 ||
            reservation.selectedServices.length === 0 ||
            reservation.totalMeals === 0
          }
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-[#1d4fed] px-5 py-4 font-bold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
            <Check size={18} />
          </span>
          {reservation.confirmLoading
            ? "Confirmation..."
            : "Confirmer la réservation"}
        </button>
      </div>
    </div>
  );
};

export default ReservationRecap;