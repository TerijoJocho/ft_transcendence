import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function PublicRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();

  // Si DÉJÀ connecté, va au dashboard
  // Sinon (pas connecté), affiche la page publique (login/signup)
  if (user) 
    return <Navigate to="/dashboard" replace />;

  return children;
}
