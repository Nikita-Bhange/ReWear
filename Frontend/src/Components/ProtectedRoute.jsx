import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../Context/User";

const ProtectedRoute = ({ children, adminOnly }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;
