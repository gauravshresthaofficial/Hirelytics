import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import AppLayout from "../layout/AppLayout";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    // <Outlet />
    <AppLayout>{children}</AppLayout>
  );
};

export default ProtectedRoute;
