import { Outlet, NavLink } from "react-router-dom";
import {
  Home,
  CalendarPlus,
  QrCode,
  History,
  LogOut,
  User,
  Wallet,
} from "lucide-react";
import logoRU from "../assets/logo-ru.png";
import { useAuth } from "../hooks/useAuth";

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const savedAuth = JSON.parse(localStorage.getItem("ru_auth") || "null");
  const savedUser = JSON.parse(localStorage.getItem("user") || "null");
  const displayUser = user || savedAuth?.user || savedUser || {};
  const displaySolde = Number(
    displayUser?.solde ??
      displayUser?.balance ??
      savedAuth?.user?.solde ??
      savedUser?.solde ??
      0
  );

  const menuItems = [
    { label: "Accueil", path: "/student/dashboard", icon: Home },
    { label: "Réserver", path: "/student/reserver", icon: CalendarPlus },
    { label: "QR Code", path: "/student/qrcode", icon: QrCode },
    { label: "Historique", path: "/student/historique", icon: History },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-200 flex flex-col justify-between">
        <div>
          {/* Header / Logo */}
          <div className="h-28 px-5 border-b border-slate-100 flex items-center justify-center">
            <div className="flex items-center gap-4">
              <img
                src={logoRU}
                alt="Restaurant Universitaire"
                className="w-16 h-16 object-contain"
              />

              <div className="leading-tight">
                <h1 className="text-slate-900 font-bold text-xl">
                  Restaurant
                </h1>
                <h2 className="text-slate-900 font-bold text-xl">
                  Universitaire
                </h2>
              </div>
            </div>
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
                    `flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                    }`
                  }
                >
                  <Icon size={21} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom user */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <User size={22} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {displayUser?.prenom || "Sara"} {displayUser?.nom || "Benali"}
                </h3>
                <p className="text-xs text-slate-500">
                  {displayUser?.apogee || "A12345"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Wallet size={16} />
              <span>Solde :</span>
              <strong className="text-slate-800">
                {displaySolde.toFixed(2)} DH
              </strong>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 font-semibold transition"
          >
            <LogOut size={18} />
            Se déconnecter
          </button>
        </div>
      </aside>

      <main className="ml-72 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
