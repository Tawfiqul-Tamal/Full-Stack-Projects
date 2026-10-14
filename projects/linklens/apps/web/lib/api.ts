import type { Analytics, LinkView, Session, User } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001/api";
const TOKEN_KEY = "linklens_token";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable: the session lasts until refresh */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* nothing to clear */
    }
  },
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = tokenStore.get();
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Can't reach the API. Start it with `npm run dev:api` and try again.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.message ?? `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = {
  register: (name: string, email: string, password: string) =>
    request<Session>("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  login: (email: string, password: string) =>
    request<Session>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => request<User>("/auth/me"),
  links: () => request<LinkView[]>("/links"),
  analytics: () => request<Analytics>("/analytics"),
  createLink: (url: string, alias: string) =>
    request<LinkView>("/links", { method: "POST", body: JSON.stringify({ url, alias }) }),
  removeLink: (id: string) => request<void>(`/links/${id}`, { method: "DELETE" }),
  loadDemo: () => request<LinkView[]>("/links/demo", { method: "POST" }),
};
