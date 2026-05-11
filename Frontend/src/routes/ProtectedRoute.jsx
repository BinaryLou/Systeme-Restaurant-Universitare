import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, loginPath = "/login" }) => {
  const token = localStorage.getItem("accessToken");

  const savedAuth = JSON.parse(localStorage.getItem("ru_auth") || "null");
  const savedUser = JSON.parse(localStorage.getItem("user") || "null");

  const user = savedAuth?.user || savedUser;
  const role = savedAuth?.role || user?.role;

  if (!token || !user) {
    return <Navigate to={loginPath} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;