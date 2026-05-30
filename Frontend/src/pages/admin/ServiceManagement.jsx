import React, { useEffect, useState } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getServices, updateService } from '../../api/serviceApi';
import ServiceRow from '../../components/admin/ServiceRow';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await getServices();
      // data est probablement le payload (tableau) directement
      setServices(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      toast.error("Erreur lors du chargement des services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSaveService = async (id, payload) => {
    await updateService(id, payload);
    // Rafraîchir les services après la sauvegarde
    await fetchServices();
  };

  if (loading && services.length === 0) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Trier pour avoir DEJEUNER en premier
  const sortedServices = [...services].sort((a, b) => {
    if (a.type_repas === 'DEJEUNER') return -1;
    if (b.type_repas === 'DEJEUNER') return 1;
    return 0;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Configuration des Services</h2>
          <p className="text-sm text-slate-500">Gérez les horaires des services de restauration</p>
        </div>
      </div>

      {/* Services Table Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-4 items-center p-4 bg-slate-50 border-b border-slate-100">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type de Service</div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Heure de Début</div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Heure de Fin</div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</div>
        </div>

        <div className="divide-y divide-slate-100">
          {sortedServices.map(service => (
            <ServiceRow 
              key={service.id_service} 
              service={service} 
              onSave={handleSaveService} 
            />
          ))}
          {sortedServices.length === 0 && !loading && (
            <div className="p-8 text-center text-slate-500">
              Aucun service configuré.
            </div>
          )}
        </div>
      </div>

      {/* Information Alert */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-1">Information</h4>
        <p className="text-sm text-blue-600/80">
          Les modifications des horaires de service affecteront toutes les nouvelles réservations. Les réservations existantes ne seront pas modifiées.
        </p>
      </div>
    </div>
  );
};

export default ServiceManagement;
