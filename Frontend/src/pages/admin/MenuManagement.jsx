import React, { useState, useEffect } from 'react';
import { Utensils, Loader2, ShieldCheck, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { getWeeklyMenus, upsertWeeklyMenu, publishWeeklyMenu } from '../../api/menuApi';
import WeeklyMenuForm from '../../components/admin/WeeklyMenuForm';
import MenuCalendarPreview from '../../components/admin/MenuCalendarPreview';
import MenuExceptionModal from '../../components/admin/MenuExceptionModal';

const DAYS = [
  { id: 1, name: "Lundi" },
  { id: 2, name: "Mardi" },
  { id: 3, name: "Mercredi" },
  { id: 4, name: "Jeudi" },
  { id: 5, name: "Vendredi" },
  { id: 6, name: "Samedi" },
  { id: 7, name: "Dimanche" }
];

const MenuManagement = () => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [weeklyMenus, setWeeklyMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshCalendar, setRefreshCalendar] = useState(0);

  // Exception Modal State
  const [exceptionDate, setExceptionDate] = useState(null);
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);

  const handleDateClick = (dayObj) => {
    setExceptionDate(dayObj.date);
    setIsExceptionModalOpen(true);
  };

  const handleSaveExceptionSuccess = () => {
    setIsExceptionModalOpen(false);
    setRefreshCalendar(prev => prev + 1);
    fetchMenus();
  };

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const data = await getWeeklyMenus();
      setWeeklyMenus(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      toast.error("Erreur lors du chargement des menus.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleSaveMenu = async (payload) => {
    setSaving(true);
    try {
      await upsertWeeklyMenu(selectedDay, payload);
      toast.success("Menu enregistré avec succès.");
      await fetchMenus();
      setRefreshCalendar(prev => prev + 1);
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de l'enregistrement.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishMenu = async (isPublished) => {
    setSaving(true);
    try {
      await publishWeeklyMenu(selectedDay, isPublished);
      toast.success(isPublished ? "Menu publié avec succès." : "Menu passé en brouillon.");
      await fetchMenus();
      setRefreshCalendar(prev => prev + 1);
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de la mise à jour du statut.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const selectedMenu = weeklyMenus.find(m => m.day_of_week === selectedDay);
  const selectedDayName = DAYS.find(d => d.id === selectedDay)?.name || "Lundi";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <Utensils className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gestion des Menus</h2>
          <p className="text-sm text-slate-500 mt-1">Menus fixes par jour de la semaine, répétés automatiquement</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3 border border-blue-100">
        <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-blue-800">Système de menus par jour de la semaine</h4>
          <p className="text-sm text-blue-600/80 mt-1">
            Les menus sont définis <span className="font-semibold">par jour de la semaine</span> (Lundi, Mardi, etc.) et <span className="font-semibold">se répètent automatiquement chaque semaine</span>. Modifier le menu d'un jour met à jour <span className="font-semibold">tous les futurs {selectedDayName.toLowerCase()}s</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Day Selection & Editor */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Day Cards */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </span>
              Menus Fixes par Jour de la Semaine
            </h3>
            <p className="text-xs text-slate-500 mb-6 ml-8">Ces menus se répètent automatiquement chaque semaine</p>

            {loading && weeklyMenus.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {DAYS.map(day => {
                  const menuForDay = weeklyMenus.find(m => m.day_of_week === day.id);
                  const isSelected = selectedDay === day.id;
                  const isPublished = menuForDay?.is_published;
                  const isClosed = menuForDay?.is_closed;

                  return (
                    <button
                      key={day.id}
                      onClick={() => setSelectedDay(day.id)}
                      className={`relative p-4 rounded-xl border text-left transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500' 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className={`font-bold ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                          {day.name}
                        </span>
                        {isPublished && !isClosed && (
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                        )}
                      </div>
                      
                      {isClosed ? (
                        <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded uppercase tracking-wider">
                          Fermé
                        </span>
                      ) : (
                        menuForDay ? (
                          <span className={`inline-block px-2 py-1 text-[10px] font-semibold rounded uppercase tracking-wider ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}>
                            Menu standard
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-semibold rounded uppercase tracking-wider">
                            Non configuré
                          </span>
                        )
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="flex-1">
             <WeeklyMenuForm 
               dayMenu={selectedMenu}
               dayOfWeek={selectedDay}
               dayName={selectedDayName}
               onSave={handleSaveMenu}
               onPublish={handlePublishMenu}
               loading={saving}
             />
          </div>
        </div>

        {/* Right Column - Calendar */}
        <div className="lg:col-span-1 h-full">
          <MenuCalendarPreview 
            refreshTrigger={refreshCalendar} 
            onDateClick={handleDateClick} 
          />
        </div>

      </div>

      <MenuExceptionModal
        isOpen={isExceptionModalOpen}
        date={exceptionDate}
        onClose={() => setIsExceptionModalOpen(false)}
        onSaveSuccess={handleSaveExceptionSuccess}
      />
    </div>
  );
};

export default MenuManagement;
