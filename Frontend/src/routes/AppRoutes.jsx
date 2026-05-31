import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import StaffRouteGuard from "./StaffRouteGuard";
import AdminRouteGuard from "./AdminRouteGuard";

// Student
import StudentLogin from "../pages/auth/StudentLogin";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import StudentLayout from "../layouts/StudentLayout";
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentHistory from "../pages/student/StudentHistory";
import StudentQrCode from "../pages/student/StudentQrCode";
import StudentReservation from "../pages/student/StudentReservation";
import StudentProfile from "../pages/student/StudentProfile";

// Admin
import AdminLogin from "../pages/auth/AdminLogin";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ServiceManagement from "../pages/admin/ServiceManagement";
import MenuManagement from "../pages/admin/MenuManagement";
import AdminStats from "../pages/admin/AdminStats";

// Staff
import StaffLayout from "../layouts/StaffLayout";
import StaffPinAccess from "../pages/staff/StaffPinAccess";
import ScanDashboard from "../pages/staff/ScanDashboard";




const Unauthorized = () => {
  return <h1>Accès non autorisé</h1>;
};



const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<StudentLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Staff routes - sans JWT */}
        <Route path="/staff/pin" element={<StaffPinAccess />} />

        <Route element={<StaffRouteGuard />}>
          <Route element={<StaffLayout />}>
            <Route path="/staff/dashboard" element={<ScanDashboard />} />
            <Route path="/staff/scan" element={<Navigate to="/staff/dashboard" replace />} />
          </Route>
        </Route>

        {/* Student routes */}
        <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/reserver" element={<StudentReservation />} />
            <Route path="/student/historique" element={<StudentHistory />} />
            <Route path="/student/qrcode" element={<StudentQrCode />} />
            <Route path="/student/profil" element={<StudentProfile />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<AdminRouteGuard redirectPath="/admin/login" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/services" element={<ServiceManagement />} />
            <Route path="/admin/menus" element={<MenuManagement />} />
            <Route path="/admin/statistics" element={<AdminStats />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
