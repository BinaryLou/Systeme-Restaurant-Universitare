const MenuTooltip = ({ dateKey, reservation }) => {
  const { hoveredDate, menuCache } = reservation;
  const menuState = menuCache[dateKey];

  if (!hoveredDate || hoveredDate !== dateKey) return null;

  return (
    <div className="pointer-events-none absolute left-1/2 bottom-full z-50 mb-3 w-72 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xl">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
        Menu du jour
      </p>

      {menuState?.loading && (
        <p className="text-sm text-slate-500">Chargement...</p>
      )}

      {menuState?.error && (
        <p className="text-sm font-medium text-red-500">{menuState.error}</p>
      )}

      {menuState?.data && (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-bold text-slate-900">
              {menuState.data.label || "Menu disponible"}
            </p>
            <p className="text-xs text-slate-500">
              Source : {menuState.data.source || "standard"}
            </p>
          </div>

          {menuState.data.is_closed ? (
            <p className="text-sm font-semibold text-red-500">
              Restaurant fermé ce jour
            </p>
          ) : (
            <>
              {menuState.data.lunch_content && (
                <div>
                  <p className="text-xs font-bold text-green-600">
                    Déjeuner : 11:00 - 14:30
                  </p>
                  <ul className="mt-1 space-y-1 text-xs text-slate-600">
                    {Object.values(menuState.data.lunch_content).map(
                      (item, index) => (
                        <li key={index}>• {item}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {menuState.data.dinner_content && (
                <div>
                  <p className="text-xs font-bold text-blue-600">
                    Dîner : 17:00 - 20:00
                  </p>
                  <ul className="mt-1 space-y-1 text-xs text-slate-600">
                    {Object.values(menuState.data.dinner_content).map(
                      (item, index) => (
                        <li key={index}>• {item}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {!menuState.data.lunch_content &&
                !menuState.data.dinner_content && (
                  <p className="text-sm font-semibold text-red-500">
                    Aucun repas disponible ce jour
                  </p>
                )}
            </>
          )}
        </div>
      )}

      <div className="absolute left-1/2 -bottom-2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-slate-200 bg-white" />
    </div>
  );
};

export default MenuTooltip;
