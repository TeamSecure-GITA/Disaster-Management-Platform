import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const userLoggedIn =
    localStorage.getItem("isUserLoggedIn") === "true";

  const adminLoggedIn =
    localStorage.getItem("isAdminLoggedIn") === "true";

  if (role === "admin" && !adminLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (role === "user" && !userLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;