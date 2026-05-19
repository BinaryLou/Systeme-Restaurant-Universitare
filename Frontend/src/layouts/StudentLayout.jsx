import { Outlet, NavLink, Link } from "react-router-dom";
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
    { 
      label: "Accueil", 
      path: "/student/dashboard", 
      icon: Home,
      activeColor: "text-blue-600 bg-blue-50",
      indicatorColor: "bg-blue-600"
    },
    { 
      label: "Réserver", 
      path: "/student/reserver", 
      icon: CalendarPlus,
      activeColor: "text-green-600 bg-green-50",
      indicatorColor: "bg-green-600"
    },
    { 
      label: "QR Code", 
      path: "/student/qrcode", 
      icon: QrCode,
      activeColor: "text-blue-600 bg-blue-50",
      indicatorColor: "bg-blue-600"
    },
    { 
      label: "Historique", 
      path: "/student/historique", 
      icon: History,
      activeColor: "text-blue-600 bg-blue-50",
      indicatorColor: "bg-blue-600"
    },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100 px-4 sm:px-5 py-3 flex items-center justify-between gap-2">
        <Link to="/student/dashboard" className="flex items-center gap-3 shrink-1 min-w-0 hover:opacity-80 transition-opacity">
          <img
            src={logoRU}
            alt="Restaurant Universitaire"
            className="w-11 h-11 object-contain shrink-0"
          />
          <span className="text-slate-900 font-bold text-[14px] sm:text-[15px] tracking-tight truncate">
            Restaurant Universitaire
          </span>
        </Link>
        
        <div className="flex items-center gap-2">
          <Link
            to="/student/profil"
            className="w-10 h-10 shrink-0 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"
            aria-label="Mon Profil"
          >
            <User size={20} strokeWidth={2.5} />
          </Link>
          <button
            onClick={handleLogout}
            className="w-10 h-10 shrink-0 flex items-center justify-center bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"
            aria-label="Se déconnecter"
          >
            <LogOut size={20} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-200 flex-col justify-between z-40">
        <div>
          {/* Header / Logo */}
          <div className="h-28 px-5 border-b border-slate-100 flex items-center justify-center">
            <Link to="/student/dashboard" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
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
            </Link>
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
          <Link to="/student/profil" className="block bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100 hover:bg-slate-100 transition cursor-pointer">
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
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 font-semibold transition"
          >
            <LogOut size={18} />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full lg:ml-72 p-4 lg:p-8 pb-24 lg:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 px-2 py-2 z-50 flex justify-around items-center pb-safe">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 p-2 w-[72px] rounded-2xl transition-all duration-200 ${
                  isActive
                    ? item.activeColor
                    : "text-slate-400 hover:text-slate-600"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div 
                      className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-md ${item.indicatorColor}`} 
                    />
                  )}
                  <Icon size={24} className={isActive ? "stroke-[2.5px]" : "stroke-2"} />
                  <span className="text-[10px] font-semibold">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default StudentLayout;