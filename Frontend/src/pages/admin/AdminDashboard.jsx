import React, { useState, useEffect } from "react";
import { Ticket, Calendar, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import StatCardWidget from "../../components/admin/StatCardWidget";
import { getDashboardStats } from "../../api/statisticsApi";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();
        setStats(response);
      } catch (err) {
        setError("Erreur lors du chargement des statistiques.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4 bg-red-50 rounded-xl">
        {error}
      </div>
    );
  }

  const { cards = {}, charts = {}, recentActivity = [] } = stats || {};

  const formatDayName = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.toLocaleDateString('fr-FR', { weekday: 'short' });
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const areaData = (charts.dailyReservations || []).map(item => ({
    name: formatDayName(item.label),
    value: item.value
  }));

  const barData = (charts.serviceSplit || []).map(item => ({
    name: item.label,
    value: item.value
  }));

  const getStatusColor = (status) => {
    switch (status) {
      case "RESERVEE": return "bg-blue-500";
      case "VALIDEE": return "bg-green-500";
      case "ANNULEE": return "bg-red-500";
      case "EN_ATTENTE": return "bg-orange-500";
      default: return "bg-slate-500";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-page-fade">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardWidget
          title="Réservations Aujourd'hui"
          value={cards.reservationsToday || 0}
          icon={Ticket}
          trend=""
          trendColor="text-slate-500"
          iconColor="text-blue-500"
          iconBg="bg-blue-50"
        />
        <StatCardWidget
          title="Réservations Cette Semaine"
          value={cards.reservationsThisWeek || 0}
          icon={Calendar}
          trend=""
          trendColor="text-slate-500"
          iconColor="text-green-500"
          iconBg="bg-green-50"
        />
        <StatCardWidget
          title="Tickets Utilisés"
          value={cards.usedTickets || 0}
          icon={CheckCircle2}
          trend={`${cards.usageRate || 0}%`}
          trendColor="text-purple-500"
          iconColor="text-purple-500"
          iconBg="bg-purple-50"
        />
        <StatCardWidget
          title="Taux de Non-Présentation"
          value={`${cards.noShowRate || 0}%`}
          icon={AlertTriangle}
          trend=""
          trendColor="text-slate-500"
          iconColor="text-orange-500"
          iconBg="bg-orange-50"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart: Réservations par Jour */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Réservations par Jour (7 derniers jours)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Répartition par Service */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Répartition par Service (Global)</h3>
          <div className="h-72 flex flex-col">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center mt-2 items-center gap-2">
              <div className="w-3 h-3 bg-[#10b981] rounded-sm"></div>
              <span className="text-xs font-medium text-slate-500">Réservations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Activité Récente (Réservations)</h3>
        <div className="space-y-6">
          {recentActivity.map((activity, index) => (
            <div key={activity.id_reservation || index} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(activity.statut)} shrink-0`}></div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Réservation {activity.statut?.toLowerCase() || ''}</h4>
                  <p className="text-xs text-slate-500">{activity.apogee} - {activity.email}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">Pour le : {formatDate(activity.date_repas)} ({activity.type_repas})</span>
            </div>
          ))}
          {recentActivity.length === 0 && (
             <p className="text-sm text-slate-500 text-center py-4">Aucune activité récente.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
