const StatCardWidget = ({ title, value, icon: Icon, trend, trendColor, iconColor, iconBg }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-40">
      <div className="flex justify-between items-start mb-2">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
          <Icon size={24} />
        </div>
        <span className={`text-sm font-semibold ${trendColor}`}>{trend}</span>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
      </div>
    </div>
  );
};

export default StatCardWidget;
