const API_URL = "https://localhost";
import type { User } from "../auth/core/authCore.ts";
import type { Friends } from "../hooks/useFriends.ts";

async function request(endpoint: string, options: RequestInit = {}, isRetry = false)
{
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (response.status === 401 && !isRetry) 
  {
    const refresh = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!refresh.ok)
      throw new Error("Session expired");
    return request(endpoint, options, true);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) throw new Error(data?.message || "Erreur serveur");

  return data;
}

export function login(data: 
{
  identifier: string;
  password: string
}): Promise<User> {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function register(data:
{
  pseudo: string;
  mail: string;
  password: string;
}) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function me(): Promise<User>
{
  return request("/api/auth/me", {
    method: "GET",
  });
}

export function logout() {
  return request("/api/auth/logout", {
    method: "POST",
  });
}

export function changeStatus(data:
{
  status: string;
}) {
  return request("/api/user/status", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// récupère la liste d'amis avec isFavFriend inclus
export function getFriendsList(): Promise<Friends[]>
{
  return request("/api/user/friendship/get", {
    method: "GET",
  });
}

// ajouter un ami
export function addFriend(data: { userId: number })
{
  return request("/api/user/friendship/add", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// toggle favori (le backend gère add/remove selon l'état actuel)
export function toggleFavFriend(data: { userId: number })
{
  return request("/api/user/friendship/toggleFav", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// enlever un ami
export function removeFriend(data: { userId: number })
{
  return request("/api/user/friendship/remove", {
    method: "DELETE",
    body: JSON.stringify(data),
  });
}

// bloquer un utilisateur
export function blockUser(data: { userId: number })
{
  return request("/api/user/friendship/block", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// requete pour chercher qqun
export function searchUser(data: {username: string}): Promise<Friends[]>
{
    return request(`/api/user/search?username=${data.username}`, {
        method: "GET",
    });
}