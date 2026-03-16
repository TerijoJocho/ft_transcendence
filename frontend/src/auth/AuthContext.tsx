//composant qui fourni le context Auth a toute l'app
//contient l'etat user
//expose login, clearAuth
//dit si le user est connecté

import { useState, useCallback } from "react";
import { AuthContext, type User } from "./core/authCore";
import * as api from "../api/api.ts"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((user: User) => {
    setUser(user);
    setIsLoading(false);
  }, []);

  const clearAuth = useCallback(async () => {
    setUser(null);
    setIsLoading(false);
    return api.logout();
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  return (
    <AuthContext.Provider value={{ user, login, clearAuth, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
