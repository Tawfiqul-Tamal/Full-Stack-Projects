import type { Stats, Task, TrendPoint } from "../types";

const DAY = 24 * 60 * 60 * 1000;
const dayKey = (date: Date | string) => new Date(date).toISOString().slice(0, 10);

export function computeStats(tasks: Task[], days = 14, now = Date.now()): Stats {
  const byStatus = { todo: 0, in_progress: 0, done: 0 };
  const byPriority = { low: 0, medium: 0, high: 0 };

  for (const task of tasks) {
    byStatus[task.status] += 1;
    byPriority[task.priority] += 1;
  }

  const points = new Map<string, TrendPoint>();
  for (let i = days - 1; i >= 0; i--) {
    const date = dayKey(new Date(now - i * DAY));
    points.set(date, { date, created: 0, completed: 0 });
  }
  for (const task of tasks) {
    const created = points.get(dayKey(task.createdAt));
    if (created) created.created += 1;
    if (task.completedAt) {
      const completed = points.get(dayKey(task.completedAt));
      if (completed) completed.completed += 1;
    }
  }

  const total = tasks.length;
  return {
    total,
    completionRate: total === 0 ? 0 : Math.round((byStatus.done / total) * 100),
    byStatus,
    byPriority,
    trend: [...points.values()],
  };
}
