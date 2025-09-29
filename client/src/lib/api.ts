import { API_BASE_URL } from "./bridge";

export async function registerUser(data: { name: string; email: string; password: string; avatarUrl?: string }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to register user");
  }
  return response.json();
}

export async function loginUser(data: { email: string; password: string }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to login");
  }
  return response.json();
}

export async function getUser(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  return response.json();
}

export async function createAvatar(token: string, avatarData: FormData) {
  const response = await fetch(`${API_BASE_URL}/api/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: avatarData,
  });
  if (!response.ok) {
    throw new Error("Failed to create avatar");
  }
  return response.json();
}