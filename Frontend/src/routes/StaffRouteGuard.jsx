import { Navigate, Outlet } from "react-router-dom";

const StaffRouteGuard = ({ redirectPath = "/staff/pin" }) => {
  const staffPin = sessionStorage.getItem("staffPin");

  if (!staffPin) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default StaffRouteGuard;
