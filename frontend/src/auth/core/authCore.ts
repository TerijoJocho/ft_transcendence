import { createContext } from "react";

export type User = {
  id: number;
  pseudo: string;
};

export type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  clearAuth: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);
