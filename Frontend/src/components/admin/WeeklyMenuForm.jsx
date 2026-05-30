import React, { useState, useEffect } from 'react';
import { Pencil, Check, X, Loader2, AlertCircle } from 'lucide-react';

const emptyContent = { entree: '', plat: '', accompagnement: '', dessert: '' };

const WeeklyMenuForm = ({ dayMenu, dayOfWeek, dayName, onSave, onPublish, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [lunchContent, setLunchContent] = useState(emptyContent);
  const [dinnerContent, setDinnerContent] = useState(emptyContent);

  useEffect(() => {
    if (dayMenu) {
      setIsClosed(dayMenu.is_closed || false);
      setLunchContent(dayMenu.lunch_content || emptyContent);
      setDinnerContent(dayMenu.dinner_content || emptyContent);
    } else {
      setIsClosed(false);
      setLunchContent(emptyContent);
      setDinnerContent(emptyContent);
    }
    setIsEditing(false);
  }, [dayMenu, dayOfWeek]);

  const handleSave = () => {
    onSave({
      label: `Menu du ${dayName}`,
      is_closed: isClosed,
      lunch_content: isClosed ? null : lunchContent,
      dinner_content: isClosed ? null : dinnerContent,
      is_published: dayMenu ? dayMenu.is_published : false
    });
    setIsEditing(false); // Can be managed here or parent, let's reset here assuming success
  };

  const handleCancel = () => {
    if (dayMenu) {
      setIsClosed(dayMenu.is_closed || false);
      setLunchContent(dayMenu.lunch_content || emptyContent);
      setDinnerContent(dayMenu.dinner_content || emptyContent);
    } else {
      setIsClosed(false);
      setLunchContent(emptyContent);
      setDinnerContent(emptyContent);
    }
    setIsEditing(false);
  };

  const handleChange = (meal, field, value) => {
    if (meal === 'lunch') {
      setLunchContent(prev => ({ ...prev, [field]: value }));
    } else {
      setDinnerContent(prev => ({ ...prev, [field]: value }));
    }
  };

  const renderContentDisplay = (content, title) => {
    if (!content) return null;
    return (
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">{title}</h4>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 space-y-2">
          <p><span className="font-medium text-slate-700">Entrée :</span> {content.entree || '-'}</p>
          <p><span className="font-medium text-slate-700">Plat :</span> {content.plat || '-'}</p>
          <p><span className="font-medium text-slate-700">Accompagnement :</span> {content.accompagnement || '-'}</p>
          <p><span className="font-medium text-slate-700">Dessert :</span> {content.dessert || '-'}</p>
        </div>
      </div>
    );
  };

  const renderContentEdit = (content, title, mealType) => {
    return (
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">{title}</h4>
        <div className="space-y-3">
          {['entree', 'plat', 'accompagnement', 'dessert'].map(field => (
            <div key={field}>
              <label className="block text-xs font-medium text-slate-500 capitalize mb-1">
                {field}
              </label>
              <input
                type="text"
                value={content[field] || ''}
                onChange={(e) => handleChange(mealType, field, e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder={`Saisir ${field}...`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-blue-600 bg-blue-100 p-1.5 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </span>
            <span className="text-sm font-semibold text-blue-800">Menu standard du {dayName.toLowerCase()}</span>
          </div>
          <p className="text-xs text-blue-600/80 ml-8">Ce menu se répète automatiquement chaque {dayName.toLowerCase()} de toutes les semaines.</p>
        </div>
      </div>

      <div className="p-6 flex-1">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-slate-800">Menu du {dayName}</h3>
            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">Menu standard</span>
          </div>
          
          {dayMenu && (
            <button 
              onClick={() => onPublish(!dayMenu.is_published)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                dayMenu.is_published 
                  ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                  : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
              }`}
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : (dayMenu.is_published ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />)}
              {dayMenu.is_published ? 'Publié' : 'Brouillon (Cliquer pour publier)'}
            </button>
          )}
        </div>

        {isEditing ? (
          <div>
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isClosed} 
                  onChange={(e) => setIsClosed(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                Marquer ce jour comme fermé (aucun menu)
              </label>
            </div>

            {!isClosed && (
              <>
                {renderContentEdit(lunchContent, 'Déjeuner', 'lunch')}
                {renderContentEdit(dinnerContent, 'Dîner', 'dinner')}
              </>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Enregistrer
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div>
            {(dayMenu && dayMenu.is_closed) ? (
              <div className="text-center py-8 text-slate-500 italic bg-slate-50 rounded-xl border border-slate-100">
                Ce jour est configuré comme fermé.
              </div>
            ) : (
              <>
                {renderContentDisplay(lunchContent, 'Déjeuner')}
                {renderContentDisplay(dinnerContent, 'Dîner')}
                {(!lunchContent && !dinnerContent && !isClosed) && (
                  <div className="text-center py-8 text-slate-500 italic bg-slate-50 rounded-xl border border-slate-100">
                    Aucun menu configuré pour ce jour.
                  </div>
                )}
              </>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Modifier le menu du {dayName.toLowerCase()}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyMenuForm;
