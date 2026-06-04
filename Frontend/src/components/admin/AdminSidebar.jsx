import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Utensils,
  CalendarDays,
  BarChart3,
  Users,
  LogOut,
  User,
  X,
} from "lucide-react";
import logoRU from "../../assets/logo-ru.png";

const AdminSidebar = ({ admin, onLogout, isOpen, onClose }) => {
  const menuItems = [
    { label: "Tableau de bord", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Gestion Services", path: "/admin/services", icon: Utensils },
    { label: "Gestion Menus", path: "/admin/menus", icon: CalendarDays },
    { label: "Gestion Utilisateurs", path: "/admin/users", icon: Users },
    { label: "Statistiques", path: "/admin/statistics", icon: BarChart3 },
  ];

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-200 flex flex-col justify-between z-50 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Header / Logo */}
          <div className="h-24 px-6 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={logoRU}
                alt="RU Digital"
                className="w-10 h-10 object-contain"
              />
              <div className="leading-tight flex flex-col">
                <h1 className="text-slate-900 font-bold text-lg leading-snug">
                  Restaurant
                </h1>
                <h1 className="text-slate-900 font-bold text-lg leading-snug">
                  Universitaire
                </h1>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              aria-label="Fermer le menu"
            >
              <X size={20} />
            </button>
          </div>

        {/* Navigation */}
        <nav className="px-4 pt-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom admin */}
      <div className="p-4">
        <NavLink 
          to="/admin/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-2 mb-6 rounded-xl transition-all duration-200 p-2 ${
              isActive ? "bg-blue-50 ring-1 ring-blue-100" : "hover:bg-slate-50"
            }`
          }
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <User size={20} />
          </div>
          <div className="overflow-hidden flex-1">
            <h3 className="text-sm font-semibold text-slate-900 truncate">
              {admin?.prenom || "Admin"} {admin?.nom || "Principal"}
            </h3>
            <p className="text-xs text-slate-500">Administrateur (Profil)</p>
          </div>
        </NavLink>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 font-medium transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  </>
  );
};

export default AdminSidebar;
