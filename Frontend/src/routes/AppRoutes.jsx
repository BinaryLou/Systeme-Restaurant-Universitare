import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import StudentLogin from "../pages/auth/StudentLogin";
import AdminLogin from "../pages/auth/AdminLogin";
import ProtectedRoute from "./ProtectedRoute";

import StudentLayout from "../layouts/StudentLayout";
import AdminLayout from "../layouts/AdminLayout";
import StaffLayout from "../layouts/StaffLayout";

import StaffPinAccess from "../pages/staff/StaffPinAccess";
import StaffScan from "../pages/staff/StaffScan";

const StudentDashboard = () => {
  return <h1>Student Dashboard</h1>;
};

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