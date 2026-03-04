const API_URL = "https://localhost";
import type { User } from "../auth/core/authCore.ts";
// const API_URL = "http://localhost:3000";

//debut des api
async function request(endpoint: string, options: RequestInit = {}, isRetry = false) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (response.status === 401 && !isRetry)
  {
    const refresh = await fetch(`${API_URL}/auth/refresh`, {
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

//api pour login
export function login(data: { 
  identifier: string;
  password: string
}) : Promise<User> {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

//api pour s'inscrire
export function register(data: {
  pseudo: string;
  mail: string;
  password: string;
}) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

//api pour savoir si le user est connecté
export function me() : Promise<User> {
  return request("/auth/me", {
    method: "GET",
  });
}

//pour supp les token (access et refresh)
export function logout() {
  return request("/auth/logout", {
    method: "POST",
  });
}

//permet de changer la valeur du status du user
export function changeStatus(data: {
  status: string;
}) {
  return request("/user/status", {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}