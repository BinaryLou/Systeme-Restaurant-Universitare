import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import logoRU from "../../assets/logo-ru.png";

const StaffHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("staffPin");
    sessionStorage.removeItem("scanSessionCount");
    navigate("/staff/pin", { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <img src={logoRU} alt="Logo RU" className="w-10 h-10 object-contain" />
        <h1 className="text-xl font-bold text-blue-700">RU Ticket Scan</h1>
        <span className="hidden md:inline-block px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600 rounded-full">
          Espace personnel
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Déconnexion</span>
      </button>
    </header>
  );
};

export default StaffHeader;
