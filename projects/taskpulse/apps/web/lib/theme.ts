import type { TaskPriority, TaskStatus } from "./types";

export const STATUS_META: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: "To do", color: "#64748B" },
  in_progress: { label: "In progress", color: "#F59E0B" },
  done: { label: "Done", color: "#22D3EE" },
};

export const PRIORITY_META: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: "Low", color: "#64748B" },
  medium: { label: "Medium", color: "#6366F1" },
  high: { label: "High", color: "#F43F5E" },
};

export const TOOLTIP_STYLE = {
  background: "#1A2340",
  border: "1px solid #243050",
  borderRadius: 8,
  color: "#E6EAF5",
  fontSize: 12,
};
