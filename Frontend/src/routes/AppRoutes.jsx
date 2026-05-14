import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

// Student
import StudentLogin from "../pages/auth/StudentLogin";
import StudentLayout from "../layouts/StudentLayout";
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentHistory from "../pages/student/StudentHistory";
import StudentQrCode from "../pages/student/StudentQrCode";
import StudentReservation from "../pages/student/StudentReservation";

// Admin
import AdminLogin from "../pages/auth/AdminLogin";
import AdminLayout from "../layouts/AdminLayout";

// Staff
import StaffLayout from "../layouts/StaffLayout";
import StaffPinAccess from "../pages/staff/StaffPinAccess";
import StaffScan from "../pages/staff/StaffScan";


const AdminDashboard = () => {
  return <h1>Admin Dashboard</h1>;
};

const Unauthorized = () => {
  return <h1>Accès non autorisé</h1>;
};

const StaffScanGuard = () => {
  const staffPin = sessionStorage.getItem("staffPin");

  if (!staffPin) {
    return <Navigate to="/staff/pin" replace />;
  }

  return <Outlet />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<StudentLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Staff routes - sans JWT */}
        <Route path="/staff/pin" element={<StaffPinAccess />} />

        <Route element={<StaffScanGuard />}>
          <Route element={<StaffLayout />}>
            <Route path="/staff/scan" element={<StaffScan />} />
          </Route>
        </Route>

        {/* Student routes */}
        <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/reserver" element={<StudentReservation />} />
            <Route path="/student/historique" element={<StudentHistory />} />
            <Route path="/student/qrcode" element={<StudentQrCode />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]} loginPath="/admin/login" />
          }
        >
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
