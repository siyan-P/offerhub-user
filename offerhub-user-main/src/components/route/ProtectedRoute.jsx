import React, { useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useCheckAuth } from "../../hooks/queries/auth";
import { storeRedirectPath } from "../../utils/redirectUtils";
import LoadingSpinner from "../LoadingSpinner";

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading, error } = useCheckAuth();

  useEffect(() => {
    const token = localStorage.getItem("user-auth-token");
    const currentPath = location.pathname + location.search;

    if (!token || token === "undefined" || token === "") {
      storeRedirectPath(currentPath);
      if (location.pathname !== "/login") navigate("/login");
    }
  }, [navigate, location]);

  if (isLoading) {
    // A section-height loader, not the old full-viewport grey overlay.
    return <LoadingSpinner height="50vh" label="Checking your session" />;
  }

  if (error?.response?.status === 401) {
    localStorage.removeItem("user-auth-token");
    storeRedirectPath(location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
