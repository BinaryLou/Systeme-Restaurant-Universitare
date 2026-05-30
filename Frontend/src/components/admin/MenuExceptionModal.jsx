import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Loader2, AlertCircle, Copy, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  getMenuByDate, 
  getWeeklyMenuByDay, 
  createMenuException, 
  updateMenuException, 
  deleteMenuException 
} from '../../api/menuApi';

const emptyContent = { entree: '', plat: '', accompagnement: '', dessert: '' };

const MenuExceptionModal = ({ isOpen, date, onClose, onSaveSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prefilling, setPrefilling] = useState(false);

  const [existingExceptionId, setExistingExceptionId] = useState(null);
  const [label, setLabel] = useState('');
  const [isClosed, setIsClosed] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [reason, setReason] = useState('');
  const [lunchContent, setLunchContent] = useState(emptyContent);
  const [dinnerContent, setDinnerContent] = useState(emptyContent);

  // We keep standardMenu cached to allow pre-filling
  const [standardMenu, setStandardMenu] = useState(null);

  const formatDateFr = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getDayOfWeekFromDate = (dateStr) => {
    if (!dateStr) return 1;
    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(year, month - 1, day);
    const jsDay = dateObj.getDay(); // 0 = Sunday, 1 = Monday...
    return jsDay === 0 ? 7 : jsDay;
  };

  useEffect(() => {
    if (!isOpen || !date) return;

    const loadDateData = async () => {
      setLoading(true);
      try {
        // 1. Fetch resolved menu for the clicked date
        const resolvedResponse = await getMenuByDate(date);
        const resolvedData = resolvedResponse.data || resolvedResponse;

        // 2. Fetch the corresponding standard menu for prefill backup
        const dayOfWeek = getDayOfWeekFromDate(date);
        try {
          const standardResponse = await getWeeklyMenuByDay(dayOfWeek);
          setStandardMenu(standardResponse.data || standardResponse);
        } catch (stdErr) {
          // Standard menu might not be configured, ignore
          setStandardMenu(null);
        }

        // Initialize state based on response
        if (resolvedData && resolvedData.source === 'exception') {
          // Editing existing exception
          setExistingExceptionId(resolvedData.menu_exception_id);
          setLabel(resolvedData.label || 'Exception spéciale');
          setIsClosed(resolvedData.is_closed || false);
          setIsPublished(resolvedData.is_published !== undefined ? resolvedData.is_published : true);
          setReason(resolvedData.reason || '');
          setLunchContent(resolvedData.lunch_content || emptyContent);
          setDinnerContent(resolvedData.dinner_content || emptyContent);
        } else {
          // Creating a new exception
          setExistingExceptionId(null);
          setLabel(`Exception du ${formatDateFr(date)}`);
          setIsClosed(false);
          setIsPublished(true);
          setReason('');
          
          // Prefill with standard menu content by default if it exists
          if (resolvedData && resolvedData.source === 'standard') {
            setLunchContent(resolvedData.lunch_content || emptyContent);
            setDinnerContent(resolvedData.dinner_content || emptyContent);
          } else {
            setLunchContent(emptyContent);
            setDinnerContent(emptyContent);
          }
        }
      } catch (err) {
        toast.error("Erreur lors de la récupération des informations du menu.");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    loadDateData();
  }, [isOpen, date]);

  const handlePrefillFromStandard = () => {
    if (standardMenu) {
      setLunchContent(standardMenu.lunch_content || emptyContent);
      setDinnerContent(standardMenu.dinner_content || emptyContent);
      toast.success("Contenu pré-rempli avec le menu standard.");
    } else {
      toast.error("Aucun menu standard configuré pour ce jour de la semaine.");
    }
  };

  const handleChange = (meal, field, value) => {
    if (meal === 'lunch') {
      setLunchContent(prev => ({ ...prev, [field]: value }));
    } else {
      setDinnerContent(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!label.trim()) {
      toast.error("Le label de l'exception est obligatoire.");
      return;
    }

    setSaving(true);

    const payload = {
      menu_date: date,
      label: label.trim(),
      is_closed: isClosed,
      is_published: isPublished,
      reason: reason.trim() || null,
      lunch_content: isClosed ? null : lunchContent,
      dinner_content: isClosed ? null : dinnerContent,
    };

    try {
      if (existingExceptionId) {
        await updateMenuException(existingExceptionId, payload);
        toast.success("Exception de menu mise à jour.");
      } else {
        await createMenuException(payload);
        toast.success("Exception de menu créée.");
      }
      onSaveSuccess();
    } catch (err) {
      const msg = err.message || "Erreur lors de l'enregistrement.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingExceptionId) return;

    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette exception et restaurer le menu standard ?")) {
      return;
    }

    setSaving(true);
    try {
      await deleteMenuException(existingExceptionId);
      toast.success("Exception supprimée. Le menu standard est restauré.");
      onSaveSuccess();
    } catch (err) {
      const msg = err.message || "Erreur lors de la suppression.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const renderContentEdit = (content, title, mealType) => {
    return (
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
        <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['entree', 'plat', 'accompagnement', 'dessert'].map(field => (
            <div key={field}>
              <label className="block text-xs font-semibold text-slate-500 capitalize mb-1">
                {field === 'entree' ? 'Entrée' : field}
              </label>
              <input
                type="text"
                value={content[field] || ''}
                onChange={(e) => handleChange(mealType, field, e.target.value)}
                disabled={isClosed}
                className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50 disabled:bg-slate-100"
                placeholder={`Saisir ${field}...`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] transform transition-all duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {existingExceptionId ? "Modifier l'exception de menu" : "Créer une exception de menu"}
            </h3>
            <p className="text-xs text-blue-600 font-medium mt-1">
              Pour le {formatDateFr(date)}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-12 gap-3 text-slate-500 text-sm">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              Chargement des détails...
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Titre de l'exception
                  </label>
                  <input
                    type="text"
                    required
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Ex: Menu spécial Aïd, Travaux..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Motif / Note (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Ex: Restaurant fermé pour travaux"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col md:flex-row gap-6">
                <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={isClosed} 
                    onChange={(e) => setIsClosed(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-350 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Marquer ce jour comme fermé (repas bloqués)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={isPublished} 
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-350 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Publier immédiatement</span>
                </label>
              </div>

              {/* Dish Inputs section */}
              {isClosed ? (
                <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Jour marqué comme fermé</h4>
                    <p className="text-xs text-red-600 mt-1 leading-relaxed">
                      La saisie de plats est désactivée car le restaurant universitaire est marqué comme fermé pour cette date. Les étudiants ne pourront réserver aucun repas pour ce jour.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Menus du jour</h3>
                    {standardMenu && (
                      <button
                        type="button"
                        onClick={handlePrefillFromStandard}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 hover:underline"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Pré-remplir avec le menu standard
                      </button>
                    )}
                  </div>
                  
                  {renderContentEdit(lunchContent, 'Déjeuner', 'lunch')}
                  {renderContentEdit(dinnerContent, 'Dîner', 'dinner')}
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center gap-3 flex-wrap">
                <div>
                  {existingExceptionId && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={saving}
                      className="flex items-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer l'exception
                    </button>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-650 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-650 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuExceptionModal;
