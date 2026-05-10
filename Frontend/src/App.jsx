import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StudentLogin from "./pages/auth/StudentLogin";
import AdminLogin from "./pages/auth/AdminLogin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<StudentLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/student/dashboard" element={<h1>Student Dashboard</h1>} />
        <Route path="/admin/dashboard" element={<h1>Admin Dashboard</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;