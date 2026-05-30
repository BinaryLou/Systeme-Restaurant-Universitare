import React, { useState } from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ServiceRow = ({ service, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Extraire HH:mm depuis HH:mm:ss
  const formatTimeStr = (t) => t ? t.substring(0, 5) : "";
  
  const [startTime, setStartTime] = useState(formatTimeStr(service.heure_debut));
  const [endTime, setEndTime] = useState(formatTimeStr(service.heure_fin));
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!startTime || !endTime) {
      toast.error("Veuillez remplir les deux heures.");
      return;
    }
    
    const startMins = parseInt(startTime.split(':')[0], 10) * 60 + parseInt(startTime.split(':')[1], 10);
    const endMins = parseInt(endTime.split(':')[0], 10) * 60 + parseInt(endTime.split(':')[1], 10);
    
    if (startMins >= endMins) {
      toast.error("L'heure de début doit être antérieure à l'heure de fin.");
      return;
    }

    setLoading(true);
    try {
      await onSave(service.id_service, {
        type_repas: service.type_repas,
        heure_debut: startTime,
        heure_fin: endTime
      });
      setIsEditing(false);
      // Le toast success est géré ici ou par le parent, mais on peut le mettre ici
      toast.success(`Service ${service.type_repas.toLowerCase()} mis à jour.`);
    } catch (error) {
      const msg = error.response?.data?.message || "Erreur lors de la mise à jour.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setStartTime(formatTimeStr(service.heure_debut));
    setEndTime(formatTimeStr(service.heure_fin));
    setIsEditing(false);
  };

  const badgeColor = service.type_repas === 'DEJEUNER' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700';
  const label = service.type_repas === 'DEJEUNER' ? 'Déjeuner' : 'Dîner';

  return (
    <div className="grid grid-cols-4 items-center p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
      <div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
          {label}
        </span>
      </div>
      
      {isEditing ? (
        <>
          <div>
            <input 
              type="time" 
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={loading}
            />
          </div>
          <div>
            <input 
              type="time" 
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={loading}
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Enregistrer</span>
            </button>
            <button 
              onClick={handleCancel}
              disabled={loading}
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              <span>Annuler</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="text-slate-600 font-medium">
            {formatTimeStr(service.heure_debut)}
          </div>
          <div className="text-slate-600 font-medium">
            {formatTimeStr(service.heure_fin)}
          </div>
          <div>
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Pencil className="w-4 h-4" />
              <span>Modifier</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceRow;
