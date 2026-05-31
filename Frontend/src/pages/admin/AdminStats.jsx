import React, { useState, useEffect } from "react";
import { getDetailedStatistics } from "../../api/statisticsApi";
import AnalyticsCharts from "../../components/admin/AnalyticsCharts";

const AdminStats = () => {
  const [period, setPeriod] = useState("week");
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, [period]);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getDetailedStatistics(period);
      setStatsData(data);
    } catch (err) {
      console.error("Erreur lors de la récupération des statistiques:", err);
      setError("Impossible de charger les statistiques.");
    } finally {
      setIsLoading(false);
    }
  };

  const periodOptions = [
    { id: "day", label: "Jour" },
    { id: "week", label: "Semaine" },
    { id: "month", label: "Mois" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Statistiques & Export
          </h1>
          <p className="text-gray-500 mt-1">Analysez les tendances et exportez les données</p>
        </div>
      </div>

      {/* Sélecteur de période */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Période d'Analyse
        </h2>
        <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
          {periodOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPeriod(opt.id)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                period === opt.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chargement ou Erreur */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      ) : statsData ? (
        <>
          {/* Graphiques */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Visualisation des Données</h2>
            <AnalyticsCharts data={statsData} />
          </div>

          {/* Cartes de résumé */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Résumé Statistique</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Carte 1 : Total */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-blue-50 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Réservations</h3>
                <div className="text-3xl font-bold text-gray-900">{statsData.summary?.totalReservations || 0}</div>
              </div>

              {/* Carte 2 : Taux d'utilisation */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-green-50 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Taux d'utilisation</h3>
                <div className="text-3xl font-bold text-gray-900">{statsData.summary?.usageRate || 0}%</div>
              </div>

              {/* Carte 3 : Non-présentation */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-orange-50 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Non-présentation</h3>
                <div className="text-3xl font-bold text-gray-900">{statsData.summary?.noShowRate || 0}%</div>
                <div className="text-sm text-gray-500 mt-1">({statsData.summary?.noShowCount || 0} étudiants)</div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AdminStats;
