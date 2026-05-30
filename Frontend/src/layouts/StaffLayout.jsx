import { Outlet } from "react-router-dom";
import StaffHeader from "../components/staff/StaffHeader";

const StaffLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <StaffHeader />

      <main className="flex-grow p-2.5 sm:p-5 md:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default StaffLayout;