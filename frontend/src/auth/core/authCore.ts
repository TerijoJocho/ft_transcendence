import { createContext } from "react";

export type OngoingGameInfo = {
  gameId: number;
  gameMode: string;
  gameStatus: string;
  playerColor: string;
};

export type User = {
  id: number;
  pseudo: string;
  email: string,
  avatarUrl: string;
  isGoogleUser: boolean;
  twoFactorEnabled: boolean;
  ongoingGames?: OngoingGameInfo[];
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