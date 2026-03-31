import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { createContext } from "react";

export type User = {
  id: number;
  pseudo: string;
  level: number,
  status: string;
  avatar: string | IconDefinition;
};

export type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
  isLoading: boolean;
};

//Contexte React global qui va stocker l'utilisateur courant
export const AuthContext = createContext<AuthContextType | null>(null);