import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
import AdminSidebar from "../components/admin/AdminSidebar";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const savedAuth = JSON.parse(localStorage.getItem("ru_auth") || "null");
  const admin = savedAuth?.user || JSON.parse(localStorage.getItem("user") || "{}");
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("ru_auth");
    window.location.href = "/admin/login";
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/admin/dashboard":
        return "Tableau de bord";
      case "/admin/services":
        return "Gestion des Services";
      case "/admin/menus":
        return "Gestion des Menus";
      case "/admin/statistics":
        return "Statistiques";
      default:
        return "Administration";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <AdminSidebar 
        admin={admin} 
        onLogout={handleLogout} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="lg:ml-72 flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Section */}
        <header className="h-24 px-4 sm:px-8 flex items-center justify-between border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              aria-label="Ouvrir le menu"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{getPageTitle()}</h1>
          </div>
          
          <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
            <Bell size={24} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-green-500 border-2 border-white rounded-full"></span>
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-8 flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;