export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  completedAt: string | null;
}

export interface TrendPoint {
  date: string;
  created: number;
  completed: number;
}

export interface Stats {
  total: number;
  completionRate: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  trend: TrendPoint[];
}
