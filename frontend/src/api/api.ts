const API_URL = window.location.origin;
import { io, Socket } from "socket.io-client";
import type { User } from "../auth/core/authCore.ts";
import type { Friends } from "../hooks/useFriends.ts";
import type { SearchUserResult } from "../components/AddFriends.tsx";

export type LoginResponse =
  | User
  | {
      requiresTwoFactor: true;
      message: string;
    };

async function request(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false,
) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (response.status === 401 && !isRetry) {
    const refresh = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!refresh.ok) throw new Error("Session expired");
    return request(endpoint, options, true);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) throw new Error(data?.message || "Erreur serveur");

  return data;
}

export function login(data: {
  identifier: string;
  password: string;
}): Promise<LoginResponse> {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function login2fa(data: {
  identifier: string;
  password: string;
  reply_code: string;
  redirect: boolean;
}): Promise<User> {
  return request("/api/auth/login2fa", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

//recupere les stats du joueur pour le dashboard
export function userStats(data: { id: number }) {
  return request("/api/auth/userStats", {
    method: "GET",
    body: JSON.stringify(data),
  });
}

export function register(data: {
  pseudo: string;
  mail: string;
  password: string;
}) {
  return request("/api/users/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

//il y a deux me dans le backend, changer le nom de celui d'Aisha pour 'userStats'
export function me(): Promise<User> {
  return request("/api/users/me", {
    method: "GET",
  });
}

//pour changer des infos sur le profil
export function updateProfile(data: {
  id: number;
  pseudo: string;
  email: string;
  newPassword: string;
  confirmNewPassword: string;
  avatar: string;
}) {
  const payload: {
    pseudo?: string;
    email?: string;
    newPassword?: string;
    avatar?: string;
  } = {};

  if (data.pseudo?.trim()) payload.pseudo = data.pseudo.trim();
  if (data.email?.trim()) payload.email = data.email.trim();
  if (data.newPassword?.trim()) payload.newPassword = data.newPassword;
  if (data.avatar?.trim()) payload.avatar = data.avatar.trim();

  return request("/api/users/update", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

//pour supp le compte
export function deleteAccount() {
  return request("/api/users/delete", {
    method: "DELETE",
  });
}

export function logout() {
  return request("/api/auth/logout", {
    method: "POST",
  });
}

// récupère la liste d'amis avec isFavFriend inclus
export function getFriendsList(): Promise<Friends[]> {
  return request("/api/friendship/get", {
    method: "GET",
  });
}

// ajouter un ami
export function addFriend(data: { userId: number }) {
  return request("/api/friendship/add", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// enlever un ami
export function removeFriend(data: { userId: number }) {
  return request("/api/friendship/remove", {
    method: "DELETE",
    body: JSON.stringify(data),
  });
}

// bloquer un utilisateur
export function changeFriendshipStatus(data: { userId: number }) {
  return request("/api/friendship/changeFriendshipStatus", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// requete pour chercher qqun
export function searchUser(data: {
  username: string;
}): Promise<SearchUserResult[]> {
  const params = new URLSearchParams({ username: data.username });
  return request(`/api/friendship/search?${params.toString()}`, {
    method: "GET",
  });
}

// Lance le flux OAuth Google via une navigation complète du navigateur.
export function google() {
  window.location.assign(`${API_URL}/api/auth/google`);
}

// 2FA
//genere le qr pour l'user
//return otpauthUrl
export function generate2FA() {
  return request("/api/2FA/generate", {
    method: "POST",
  });
}

//active le 2FA apres que l'user donne le code
export function activate2FA(data: { reply_code: string }) {
  return request("/api/2FA/active", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function delete2FA(data: { pwd: string; replyCode: string }) {
  return request("/api/2FA/delete", {
    method: "DELETE",
    body: JSON.stringify(data),
  });
}
  
export function createGame(data: { playerColor: "BLACK" | "WHITE"; gameMode: "CLASSIC" | "BLITZ" | "BULLET" }) {
  return request("/api/game/create", {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<{ gameId: number }>;
}

export function joinGame(gameId: number) {
  return request(`/api/game/${gameId}/join`, {
    method: "POST",
  });
}
  
export function getGameSession(gameId: number) {
    return request(`/api/game/${gameId}/session`, {
      method: "GET",
    }) as Promise<{
      gameId: number;
      playerColor: "WHITE" | "BLACK";
      gameStatus: "PENDING" | "ONGOING" | "COMPLETED";
      gameMode: "CLASSIC" | "BLITZ" | "BULLET";
    }>;
}
    
export function getPendingGames() {
  return request("/api/game/pending", {
    method: "GET",
  }) as Promise<{
    gameId: number;
    gameMode: "CLASSIC" | "BLITZ" | "BULLET";
    creatorName: string;
    creatorId: number;
    creatorColor: "WHITE" | "BLACK";
    gameCreatedAt: Date;
}[]>;
}

export function endGame(
  gameId: number,
  data: {
    totalNbMoves: number;
    winnerNbMoves: number;
    gameResult: "WIN" | "DRAW";
    winnerColor?: "WHITE" | "BLACK";
  },
) {
  return request(`/api/game/${gameId}/end`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function resignGame(gameId: number) {
  return request(`/api/game/${gameId}/giveup`, {
    method: "POST",
  });
}

export type GameStateSnapshot = {
  gameId: number;
  board: string[][];
  turn: "white" | "black";
  moved: Record<string, boolean>;
  ep: { row: number; col: number } | null;
  halfmove: number;
  history: string[];
  gameOver: boolean;
  status: string;
  lastMove: number[] | null;
  whiteTime: number | null;
  blackTime: number | null;
  clockStarted: boolean;
  gameResult: { winner: string; reason: string } | null;
};

export function connectGameSocket(): Socket {
  return io(`${API_URL}/game`, {
    path: "/socket.io/",
    withCredentials: true,
    transports: ["websocket"],
  });
}

export function connectChatSocket(): Socket {
  return io(`${API_URL}/chat`, {
    path: "/socket.io/",
    withCredentials: true,
    transports: ["websocket"],
  });
}
