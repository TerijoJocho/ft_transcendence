import { io, Socket } from "socket.io-client";
import type { User } from "../auth/core/authCore.ts";
import type { Friends } from "../hooks/useFriends.ts";
import type { SearchUserResult } from "../components/AddFriends.tsx";

const API_URL = window.location.origin;

type GameMode = "CLASSIC" | "BLITZ" | "BULLET";
type GameColor = "WHITE" | "BLACK";
type GameStatus = "PENDING" | "ONGOING" | "COMPLETED";
type GameResult = "WIN" | "DRAW" | "LOSE" | "PENDING";

export type LoginRequiresTwoFactorResponse = {
  requiresTwoFactor: true;
  message: string;
};

export type LoginResponse = User | LoginRequiresTwoFactorResponse;

export type ApiMessageResponse = {
  message: string;
};

export type RegisterResponse = Array<{
  playerId: number;
  playerName: string;
}>;

export type UserStatsGameHistoryEntry = {
  gameId: number;
  gameMode: GameMode;
  playerColor: GameColor;
  playerResult: GameResult;
  opponentName: string | null;
  gameDuration: string;
};

export type UserStatsResponse = {
  id: number;
  pseudo: string;
  winCount: number;
  lossCount: number;
  drawCount: number;
  totalGames: number;
  winrate: number;
  favColor: string;
  favGameMode: string;
  currentWinStreak: number;
  longestWinStreak: number;
  gameHistoryList?: UserStatsGameHistoryEntry[];
};

export type WeeklyWinratePoint = {
  dayIndex: number;
  date: string;
  winrate: number;
};

export type WeeklyWinrateResponse = {
  timezone: string;
  weekStart: string;
  points: WeeklyWinratePoint[];
};

export type LeaderboardResponse = {
  playerId: number;
  playerName: string;
  playerLevel: number;
};

export type TwoFactorSetupResponse = {
  otpauthUrl: string;
  base32: string;
};

export type TwoFactorActionResponse = {
  success: true;
};

export type CreateGameResponse = {
  gameId: number;
};

export type GameSessionResponse = {
  gameId: number;
  playerColor: GameColor;
  gameStatus: GameStatus;
  gameMode: GameMode;
};

export type PendingGameResponse = {
  gameId: number;
  gameMode: GameMode;
  creatorName: string;
  creatorId: number;
  creatorColor: GameColor;
  gameCreatedAt: string;
};

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

async function request<TResponse>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<TResponse> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const isAuthEndpoint =
    endpoint === "/api/auth/login" ||
    endpoint === "/api/auth/login2fa" ||
    endpoint === "/api/users/register";

  if (response.status === 401 && !isRetry && !isAuthEndpoint) {
    const refresh = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!refresh.ok) throw new Error("Session expired");
    return request<TResponse>(endpoint, options, true);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) throw new Error(data?.message || "Erreur serveur");

  return data as TResponse;
}

// Auth
export function login(data: {
  identifier: string;
  password: string;
}): Promise<LoginResponse> {
  return request<LoginResponse>("/api/auth/login", {
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
  return request<User>("/api/auth/login2fa", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function google(): void {
  window.location.assign(`${API_URL}/api/auth/google`);
}

export function logout(): Promise<ApiMessageResponse> {
  return request<ApiMessageResponse>("/api/auth/logout", {
    method: "POST",
  });
}

export async function refreshSession(): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Session expired");
  }
}

// Users
export function register(data: {
  pseudo: string;
  mail: string;
  password: string;
}): Promise<RegisterResponse> {
  return request<RegisterResponse>("/api/users/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function me(): Promise<User> {
  return request<User>("/api/users/me", {
    method: "GET",
  });
}

export function updateProfile(data: {
  id: number;
  pseudo: string;
  email: string;
  newPassword: string;
  confirmNewPassword: string;
  avatar: string;
}): Promise<ApiMessageResponse> {
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

  return request<ApiMessageResponse>("/api/users/update", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAccount(): Promise<ApiMessageResponse> {
  return request<ApiMessageResponse>("/api/users/delete", {
    method: "DELETE",
  });
}

// récupère les stats du joueur pour le dashboard
export function userStats(): Promise<UserStatsResponse> {
  return request<UserStatsResponse>("/api/users/userStats", {
    method: "GET",
  });
}

// récupère les winrate de la semaine
export function weeklyWinrate(): Promise<WeeklyWinrateResponse> {
  return request<WeeklyWinrateResponse>("/api/users/weeklyWinrate", {
    method: "GET",
  });
}

export function getLeaderboard(): Promise<LeaderboardResponse[]> {
  return request<LeaderboardResponse[]>("/api/users/leaderboard", {
    method: "GET",
  });
}

// Friendship
export function getFriendsList(): Promise<Friends[]> {
  return request<Friends[]>("/api/friendship/get", {
    method: "GET",
  });
}

export function addFriend(data: { userId: number }): Promise<Friends> {
  return request<Friends>("/api/friendship/add", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function removeFriend(data: { userId: number }): Promise<string> {
  return request<string>("/api/friendship/remove", {
    method: "DELETE",
    body: JSON.stringify(data),
  });
}

export function changeFriendshipStatus(data: {
  userId: number;
}): Promise<string> {
  return request<string>("/api/friendship/changeFriendshipStatus", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function searchUser(data: {
  username: string;
}): Promise<SearchUserResult[]> {
  const params = new URLSearchParams({ username: data.username });
  return request<SearchUserResult[]>(
    `/api/friendship/search?${params.toString()}`,
    {
      method: "GET",
    },
  );
}

// 2FA
export function generate2FA(): Promise<TwoFactorSetupResponse> {
  return request<TwoFactorSetupResponse>("/api/2FA/generate", {
    method: "POST",
  });
}

export function activate2FA(data: {
  reply_code: string;
}): Promise<TwoFactorActionResponse> {
  return request<TwoFactorActionResponse>("/api/2FA/active", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function delete2FA(data: {
  pwd: string;
  replyCode: string;
}): Promise<TwoFactorActionResponse> {
  return request<TwoFactorActionResponse>("/api/2FA/delete", {
    method: "DELETE",
    body: JSON.stringify(data),
  });
}

// Game
export function createGame(data: {
  playerColor: GameColor;
  gameMode: GameMode;
}): Promise<CreateGameResponse> {
  return request<CreateGameResponse>("/api/game/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function joinGame(gameId: number): Promise<void> {
  return request<void>(`/api/game/${gameId}/join`, {
    method: "POST",
  });
}

export function getGameSession(gameId: number): Promise<GameSessionResponse> {
  return request<GameSessionResponse>(`/api/game/${gameId}/session`, {
    method: "GET",
  });
}

export function getPendingGames(): Promise<PendingGameResponse[]> {
  return request<PendingGameResponse[]>("/api/game/pending", {
    method: "GET",
  });
}

export function endGame(
  gameId: number,
  data: {
    totalNbMoves: number;
    winnerNbMoves: number;
    gameResult: "WIN" | "DRAW";
    winnerColor?: GameColor;
  },
): Promise<void> {
  return request<void>(`/api/game/${gameId}/end`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function giveupGame(
  gameId: number,
  data: {
    totalNbMoves: number;
    winnerNbMoves: number;
  },
) {
  return request(`/api/game/${gameId}/giveup`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function cancelGame(gameId: number) {
  return request(`/api/game/${gameId}/cancel`, {
    method: "DELETE",
  });
}

export function connectGameSocket(): Socket {
  return io(`${API_URL}/game`, {
    path: "/socket.io/",
    withCredentials: true,
    transports: ["websocket"],
  });
}

export function connectRealtimeSocket(): Socket {
  return io(`${API_URL}/chat`, {
    path: "/socket.io/",
    withCredentials: true,
    transports: ["websocket"],
  });
}
