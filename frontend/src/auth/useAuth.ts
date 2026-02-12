import { useContext } from "react";
import { AuthContext } from "./core/authCore";

// hook personalisé
export function useAuth() {
  //lit le contexte
  const ctx = useContext(AuthContext);

  //si on appelle useAuth en dehors de AuthProvider on renvoie une erreur
  if (!ctx)
    throw new Error("useAuth must be used inside AuthProvider");
  
  //renvoie {user, login, clearAuth}
  return ctx;
}
