//composant qui fourni le context Auth a toute l'app
//contient l'etat user
//expose login, clearAuth
//dit si le user est connecté

import { useState } from "react";
import { AuthContext, type User } from "./core/authCore";
import * as api from "../api/api.ts"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  function login(user: User) {
    setUser(user);
  }

  async function clearAuth() {
    setUser(null);
    //requete pour supp le acces token et le refresh token car le user s'est deco??
    return api.logout();
  }

  return (
    <AuthContext.Provider value={{ user, login, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
