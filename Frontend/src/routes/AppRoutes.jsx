import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StudentLogin from "../pages/auth/StudentLogin";
import AdminLogin from "../pages/auth/AdminLogin";
import ProtectedRoute from "./ProtectedRoute";

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
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["STAFF"]} />}>
          <Route path="/staff/scan" element={<StaffPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;