//composant qui fourni le context Auth a toute l'app
//contient l'etat user
//expose login, clearAuth
//dit si le user est connecté

import { useState } from "react";
import { AuthContext, type User } from "./core/authCore";
import * as api from "../api/api.ts"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  function login(user: User) {
    setUser(user);
    setIsLoading(false);
  }

  async function clearAuth() {
    setUser(null);
    setIsLoading(false);
    return api.logout();
  }

  return (
    <AuthContext.Provider value={{ user, login, clearAuth, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
