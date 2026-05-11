import { Outlet } from "react-router-dom";

const StaffLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
        <h1 className="text-xl font-bold text-blue-700">RU Ticket Scan</h1>
        <span className="text-sm text-slate-500">Espace personnel</span>
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default StaffLayout;