import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

const StaffPage = () => {
  return <h1>Staff Page</h1>;
};

const Unauthorized = () => {
  return <h1>Accès non autorisé</h1>;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<StudentLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
          </Route>
        </Route>

        <Route
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]} loginPath="/admin/login" />
          }
        >
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["STAFF"]} />}>
          <Route element={<StaffLayout />}>
            <Route path="/staff/scan" element={<StaffPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />

        <Route path="/staff/pin" element={<StaffPinAccess />} />
        <Route path="/staff/scan" element={<StaffScan />} />  
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
