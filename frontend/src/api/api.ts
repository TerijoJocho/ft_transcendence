const API_URL = "https://localhost";
import type { User } from "../auth/core/authCore.ts";
import type { Friends } from "../hooks/useFriends.ts";
import type { SearchUserResult } from "../components/AddFriends.tsx";

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
}): Promise<User> {
  return request("/api/auth/login", {
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
export function deleteAccount(data: { password: string }) {
  return request("/api/users/delete", {
    method: "DELETE",
    body: JSON.stringify(data),
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
