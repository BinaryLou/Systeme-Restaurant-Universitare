import { CalendarDays } from "lucide-react";

const ReservationHeader = () => {
  return (
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
  );
};

export default ReservationHeader;