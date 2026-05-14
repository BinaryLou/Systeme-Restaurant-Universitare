import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Trash2,
  Utensils,
} from "lucide-react";
import { useState } from "react";

const StudentReservation = () => {
  const [selectedDates, setSelectedDates] = useState([27, 28]);
  const [selectedServices, setSelectedServices] = useState(["DEJEUNER", "DINER"]);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const mealPrice = 1.5;
  const totalMeals = selectedDates.length * selectedServices.length;
  const totalPrice = totalMeals * mealPrice;
  const currentBalance = 600;
  const afterPayment = currentBalance - totalPrice;

  const toggleDate = (day) => {
    if (day < 26) return;

    setSelectedDates((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const selectAllAvailable = () => {
    setSelectedDates([26, 27, 28, 29, 30, 31]);
  };

  const clearSelection = () => {
    setSelectedDates([]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] px-8 py-8">
      {/* Header */}
      <section className="rounded-[18px] bg-[#009b37] px-10 py-8 text-white shadow-xl shadow-green-900/20">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <CalendarDays size={32} />
          </div>

          <div>
            <h1 className="text-4xl font-bold">Réserver vos repas</h1>
            <p className="mt-2 text-lg text-green-50">
              Sélectionnez plusieurs dates et services en une seule fois
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_390px]">
        {/* Left */}
        <div>
          {/* Info */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-blue-700">
            <div className="flex items-start gap-3">
              <Info size={20} className="mt-0.5" />
              <div>
                <p className="font-semibold">Sélection multiple</p>
                <p className="mt-1 text-sm">
                  Cliquez sur plusieurs dates pour réserver en une seule fois.
                  Survolez un jour pour voir le menu.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 grid grid-cols-[1fr_120px] gap-3">
            <button
              onClick={selectAllAvailable}
              className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              <CalendarDays size={20} />
              Réserver tous les jours disponibles
            </button>

            <button
              onClick={clearSelection}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-4 font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              <Trash2 size={18} />
              Effacer
            </button>
          </div>

          {/* Calendar */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
                <ChevronLeft size={22} />
              </button>

              <h2 className="text-xl font-bold text-slate-900">Janvier 2026</h2>

              <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
                <ChevronRight size={22} />
              </button>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <div className="mb-4 grid grid-cols-7 text-center text-sm font-semibold text-slate-500">
                <span>Dim</span>
                <span>Lun</span>
                <span>Mar</span>
                <span>Mer</span>
                <span>Jeu</span>
                <span>Ven</span>
                <span>Sam</span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                <div />
                <div />
                <div />
                <div />
                {days.map((day) => {
                  const isPast = day < 26;
                  const isSelected = selectedDates.includes(day);

                  return (
                    <button
                      key={day}
                      onClick={() => toggleDate(day)}
                      disabled={isPast}
                      className={`relative h-24 rounded-xl border text-sm font-semibold transition
                        ${
                          isSelected
                            ? "border-[#08b94e] bg-[#08b94e] text-white shadow-md"
                            : isPast
                            ? "cursor-not-allowed border-slate-100 bg-white text-slate-300"
                            : "border-slate-100 bg-white text-slate-800 hover:border-green-300 hover:bg-green-50"
                        }`}
                    >
                      {day}

                      {isSelected && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#08b94e] shadow">
                          <Check size={13} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center gap-6 border-t border-slate-100 pt-5 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-[#08b94e]" />
                  Sélectionnée
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full border-2 border-slate-200 bg-white" />
                  Disponible
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full border-2 border-slate-200 bg-slate-50" />
                  Indisponible
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <aside className="space-y-6">
          {/* Services */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Choisir les services</h2>
            <p className="mt-1 text-sm text-slate-500">
              Sélectionnez un ou plusieurs services
            </p>

            <div className="mt-5 space-y-4">
              <button
                onClick={() => toggleService("DEJEUNER")}
                className={`flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition ${
                  selectedServices.includes("DEJEUNER")
                    ? "border-[#08b94e] bg-green-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#009b37] text-white">
                    <Utensils size={23} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Déjeuner</p>
                    <p className="text-sm text-slate-500">12:00 - 14:00</p>
                  </div>
                </div>

                {selectedServices.includes("DEJEUNER") && (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#08b94e] text-white">
                    <Check size={17} />
                  </span>
                )}
              </button>

              <button
                onClick={() => toggleService("DINER")}
                className={`flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition ${
                  selectedServices.includes("DINER")
                    ? "border-[#1d4fed] bg-blue-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1d4fed] text-white">
                    <Utensils size={23} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Dîner</p>
                    <p className="text-sm text-slate-500">19:00 - 21:00</p>
                  </div>
                </div>

                {selectedServices.includes("DINER") && (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1d4fed] text-white">
                    <Check size={17} />
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Recap */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-900/10">
            <div className="bg-[#1d4fed] px-6 py-6 text-white">
              <h2 className="text-2xl font-bold">Récapitulatif</h2>
              <p className="mt-1 text-sm text-blue-100">
                Vérifiez avant de confirmer
              </p>
            </div>

            <div className="p-6">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Dates sélectionnées
                </p>

                <div className="flex flex-wrap gap-2">
                  {selectedDates.length === 0 ? (
                    <span className="text-sm text-slate-400">Aucune date</span>
                  ) : (
                    selectedDates.map((day) => (
                      <span
                        key={day}
                        className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-[#1d4fed]"
                      >
                        {day} janv.
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="my-6 border-t border-slate-100" />

              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Services choisis
                </p>

                <div className="flex flex-wrap gap-2">
                  {selectedServices.includes("DEJEUNER") && (
                    <span className="rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-[#08b94e]">
                      ● Déjeuner
                    </span>
                  )}

                  {selectedServices.includes("DINER") && (
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-[#1d4fed]">
                      ● Dîner
                    </span>
                  )}
                </div>
              </div>

              <div className="my-6 border-t border-slate-100" />

              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Nombre de repas</span>
                  <strong className="text-slate-900">{totalMeals}</strong>
                </div>

                <div className="flex justify-between">
                  <span>Prix par repas</span>
                  <strong className="text-slate-900">{mealPrice} DH</strong>
                </div>
              </div>

              <div className="my-6 border-t border-slate-200" />

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Prix Total</span>
                <span className="text-4xl font-bold text-[#1d4fed]">
                  {totalPrice.toFixed(1)} DH
                </span>
              </div>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Solde actuel</span>
                  <strong className="text-slate-900">{currentBalance} DH</strong>
                </div>

                <div className="mt-4 flex justify-between">
                  <span className="font-bold text-slate-900">Après paiement</span>
                  <strong className="text-2xl text-[#08b94e]">
                    {afterPayment.toFixed(1)} DH
                  </strong>
                </div>
              </div>

              <button className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-[#1d4fed] px-5 py-4 font-bold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-700">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
                  <Check size={18} />
                </span>
                Confirmer la réservation
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StudentReservation;