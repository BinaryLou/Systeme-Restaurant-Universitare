import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Trash2,
} from "lucide-react";
import MenuTooltip from "./MenuTooltip";

const ReservationCalendar = ({ reservation }) => {
  return (
    <>
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

      <div className={`mt-6 grid gap-3 ${reservation.selectedDates.length > 0 ? "grid-cols-[1fr_120px]" : "grid-cols-1"}`}>
        <button
          onClick={reservation.selectAllAvailable}
          className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          <CalendarDays size={20} />
          <span className="text-sm sm:text-base">Réserver tous les jours disponibles</span>
        </button>

        {reservation.selectedDates.length > 0 && (
          <button
            onClick={reservation.clearSelection}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 sm:px-5 py-4 font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            <Trash2 size={18} />
            Effacer
          </button>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 sm:p-7 shadow-sm">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <button
            onClick={reservation.previousMonth}
            className="rounded-lg p-1.5 sm:p-2 text-slate-600 hover:bg-slate-100"
          >
            <ChevronLeft size={22} />
          </button>

          <h2 className="text-lg sm:text-xl font-bold capitalize text-slate-900">
            {reservation.getMonthLabel()}
          </h2>

          <button
            onClick={reservation.nextMonth}
            className="rounded-lg p-1.5 sm:p-2 text-slate-600 hover:bg-slate-100"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        <div className="border-t border-slate-100 pt-4 sm:pt-6">
          <div className="mb-2 sm:mb-4 grid grid-cols-7 text-center text-xs sm:text-sm font-semibold text-slate-500">
            <span>Dim</span>
            <span>Lun</span>
            <span>Mar</span>
            <span>Mer</span>
            <span>Jeu</span>
            <span>Ven</span>
            <span>Sam</span>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {reservation.calendarCells.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} />;

              const dateKey = reservation.formatDateKey(date);
              const available = reservation.isDateAvailable(date);
              const selected = reservation.selectedDates.includes(dateKey);
              const menuData = reservation.menuCache[dateKey]?.data;
              const isClosed = menuData?.is_closed;

              return (
                <button
                  key={dateKey}
                  onClick={() => reservation.toggleDate(date)}
                  onMouseEnter={() => reservation.handleDateHover(date)}
                  onMouseLeave={() => reservation.setHoveredDate(null)}
                  disabled={!available}
                  className={`relative aspect-square sm:aspect-auto sm:h-20 lg:h-24 rounded-lg sm:rounded-xl border text-xs sm:text-sm font-semibold transition
                    ${
                      selected
                        ? "border-[#08b94e] bg-[#08b94e] text-white shadow-md"
                        : !available || isClosed
                        ? "cursor-not-allowed border-slate-100 bg-white text-slate-300"
                        : "border-slate-100 bg-white text-slate-800 hover:border-green-300 hover:bg-green-50"
                    }`}
                >
                  {date.getDate()}

                  {selected && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#08b94e] shadow">
                      <Check size={13} strokeWidth={3} />
                    </span>
                  )}

                  <MenuTooltip dateKey={dateKey} reservation={reservation} />
                </button>
              );
            })}
          </div>

          <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 border-t border-slate-100 pt-4 sm:pt-5 text-xs sm:text-sm text-slate-500">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="h-4 w-4 sm:h-6 sm:w-6 rounded-full bg-[#08b94e]" />
              Sélectionnée
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="h-4 w-4 sm:h-6 sm:w-6 rounded-full border-2 border-slate-200 bg-white" />
              Disponible
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="h-4 w-4 sm:h-6 sm:w-6 rounded-full border-2 border-slate-200 bg-slate-50" />
              Indisponible
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReservationCalendar;