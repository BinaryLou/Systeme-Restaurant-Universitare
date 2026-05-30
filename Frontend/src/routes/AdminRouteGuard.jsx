import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AdminRouteGuard = ({ redirectPath = "/admin/login" }) => {
  const { user, token, role } = useAuth();

  if (!token || !user) {
    return <Navigate to={redirectPath} replace />;
  }

  if (role !== "ADMIN") {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default AdminRouteGuard;
