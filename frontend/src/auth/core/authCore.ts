import { createContext } from "react";

//peut-etre rajouter le token dans le type à terme ??
export type User = {
  id: number;
  pseudo: string;
  elo: number,
  status: string;
  avatar: string;
};

export type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  clearAuth: () => void;
};

//Contexte React global qui va stocker l'utilisateur courant
export const AuthContext = createContext<AuthContextType | null>(null);
