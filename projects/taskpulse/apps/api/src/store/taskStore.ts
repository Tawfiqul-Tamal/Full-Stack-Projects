import { randomUUID } from "node:crypto";
import type { ListQuery, CreateTaskInput, UpdateTaskInput } from "../schemas";
import type { Task } from "../types";

/**
 * In-memory repository. The public surface (list/get/create/update/remove)
 * is the only thing the routes depend on, so swapping this for Prisma,
 * Drizzle or Mongoose later does not touch the HTTP layer.
 */
export class TaskStore {
  private tasks = new Map<string, Task>();

  constructor(seed: Task[] = []) {
    seed.forEach((task) => this.tasks.set(task.id, task));
  }

  list(filter: ListQuery = {}): Task[] {
    const q = filter.q?.toLowerCase();
    return [...this.tasks.values()]
      .filter((t) => !filter.status || t.status === filter.status)
      .filter((t) => !filter.priority || t.priority === filter.priority)
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  get(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  create(input: CreateTaskInput): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: randomUUID(),
      ...input,
      createdAt: now,
      completedAt: input.status === "done" ? now : null,
    };
    this.tasks.set(task.id, task);
    return task;
  }

  update(id: string, patch: UpdateTaskInput): Task | undefined {
    const current = this.tasks.get(id);
    if (!current) return undefined;

    const next: Task = { ...current, ...patch };
    if (patch.status && patch.status !== current.status) {
      next.completedAt = patch.status === "done" ? new Date().toISOString() : null;
    }
    this.tasks.set(id, next);
    return next;
  }

  remove(id: string): boolean {
    return this.tasks.delete(id);
  }
}
