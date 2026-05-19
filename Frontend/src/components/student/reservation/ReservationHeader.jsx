import { CalendarDays } from "lucide-react";

const ReservationHeader = () => {
  return (
    <section className="rounded-[18px] bg-[#009b37] px-6 sm:px-10 py-6 sm:py-8 text-white shadow-xl shadow-green-900/20">
      <div className="flex items-center gap-4 sm:gap-5">
        <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20">
          <CalendarDays className="h-7 w-7 sm:h-8 sm:w-8" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-bold leading-tight">Réserver vos repas</h1>
          <p className="mt-1.5 text-sm sm:text-lg text-green-50 leading-snug">
            Sélectionnez plusieurs dates et services en une seule fois
          </p>
        </div>
      </div>
    </section>
  );
};

export default ReservationHeader;