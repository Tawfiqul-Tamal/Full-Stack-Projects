import type { NewTask, Stats, Task, TaskStatus } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = {
  tasks: () => request<Task[]>("/tasks"),
  stats: () => request<Stats>("/stats"),
  create: (task: NewTask) => request<Task>("/tasks", { method: "POST", body: JSON.stringify(task) }),
  setStatus: (id: string, status: TaskStatus) =>
    request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  remove: (id: string) => request<void>(`/tasks/${id}`, { method: "DELETE" }),
};
