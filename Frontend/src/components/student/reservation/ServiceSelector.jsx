import { Check, Utensils } from "lucide-react";

const ServiceSelector = ({ reservation }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Choisir les services</h2>
      <p className="mt-1 text-sm text-slate-500">
        Sélectionnez un ou plusieurs services
      </p>

      <div className="mt-5 space-y-4">
        {reservation.SERVICES.map((service) => {
          const isSelected = reservation.selectedServices.includes(service.code);
          const isLunch = service.code === "DEJEUNER";

          return (
            <button
              key={service.code}
              onClick={() => reservation.toggleService(service.code)}
              className={`flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition ${
                isSelected
                  ? isLunch
                    ? "border-[#08b94e] bg-green-50"
                    : "border-[#1d4fed] bg-blue-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${
                    isLunch ? "bg-[#009b37]" : "bg-[#1d4fed]"
                  }`}
                >
                  <Utensils size={23} />
                </div>

                <div>
                  <p className="font-bold text-slate-900">{service.label}</p>
                  <p className="text-sm text-slate-500">{service.time}</p>
                </div>
              </div>

              {isSelected && (
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-white ${
                    isLunch ? "bg-[#08b94e]" : "bg-[#1d4fed]"
                  }`}
                >
                  <Check size={17} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceSelector;