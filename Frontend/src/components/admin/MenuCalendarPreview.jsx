import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { getMenusCalendar } from '../../api/menuApi';

const MenuCalendarPreview = ({ refreshTrigger }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const data = await getMenusCalendar(year, month);
        setCalendarData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, [currentDate, refreshTrigger]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendarDays = () => {
    if (!calendarData) return null;

    const year = calendarData.year;
    const month = calendarData.month - 1; // JS months 0-11
    
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
    
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => (
      <div key={`blank-${i}`} className="h-10"></div>
    ));

    const days = calendarData.days.map((dayObj, i) => {
      const dayNum = i + 1;
      let dotColor = null;
      let bgColor = "bg-white";
      
      if (dayObj.type === "standard") dotColor = "bg-blue-500";
      if (dayObj.type === "exception") dotColor = "bg-orange-500";
      if (dayObj.type === "closed") bgColor = "bg-slate-100";

      return (
        <div key={`day-${dayNum}`} className={`h-10 flex flex-col items-center justify-center rounded-lg border border-transparent hover:border-slate-200 transition-colors ${bgColor}`}>
          <span className="text-sm font-medium text-slate-700">{dayNum}</span>
          {dotColor && <div className={`w-1.5 h-1.5 rounded-full mt-1 ${dotColor}`}></div>}
        </div>
      );
    });

    return [...blanks, ...days];
  };

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
        <CalendarIcon className="w-5 h-5 text-slate-400" />
        <div>
          <h3 className="text-base font-bold text-slate-800">Aperçu Calendrier</h3>
          <p className="text-xs text-slate-500">Visualisation des menus appliqués</p>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-lg font-bold text-slate-800">{monthNames[currentDate.getMonth()]}</span>
            <span className="text-lg font-bold text-slate-800 ml-1">{currentDate.getFullYear()}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map(d => (
            <div key={d} className="text-xs font-semibold text-slate-500 py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 flex-1 content-start relative">
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          )}
          {renderCalendarDays()}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-xs text-slate-600">Menu standard du jour appliqué</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-xs text-slate-600">Menu exceptionnel (date spécifique)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-slate-100 border border-slate-200"></div>
            <span className="text-xs text-slate-600">Fermé (aucun menu)</span>
          </div>
        </div>
        
        <div className="mt-4 bg-slate-50 rounded-xl p-4 flex items-start gap-3 border border-slate-100">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Cliquez sur une date du calendrier pour créer une exception au menu standard. <br/> <span className="italic text-slate-400">(Fonctionnalité d'exception à venir)</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MenuCalendarPreview;
