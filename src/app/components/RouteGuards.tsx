import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// pages that need a logged-in player
export function RequireAuth({ children }: { children: React.ReactElement }) {
  const { user } = useAuth();
  const { pathname, search } = useLocation();
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(pathname + search)}`} replace />;
  return children;
}
