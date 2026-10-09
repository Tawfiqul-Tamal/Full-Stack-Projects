"use client";

import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { PRIORITY_META, STATUS_META } from "@/lib/theme";
import type { Task, TaskStatus } from "@/lib/types";

const COLUMNS: TaskStatus[] = ["todo", "in_progress", "done"];
const PREV: Partial<Record<TaskStatus, TaskStatus>> = { in_progress: "todo", done: "in_progress" };
const NEXT: Partial<Record<TaskStatus, TaskStatus>> = { todo: "in_progress", in_progress: "done" };

interface Props {
  tasks: Task[];
  onMove: (task: Task, status: TaskStatus) => void;
  onDelete: (task: Task) => void;
}

export function TaskBoard({ tasks, onMove, onDelete }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {COLUMNS.map((status) => {
        const items = tasks.filter((t) => t.status === status);
        const meta = STATUS_META[status];
        return (
          <section key={status} className="rounded-xl border border-line bg-panel p-4" aria-label={meta.label}>
            <header className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} aria-hidden />
                {meta.label}
              </h3>
              <span className="rounded-md bg-raised px-2 py-0.5 text-xs text-muted">{items.length}</span>
            </header>

            <ul className="space-y-3">
              {items.length === 0 && (
                <li className="rounded-lg border border-dashed border-line p-4 text-center text-sm text-muted">
                  Nothing here yet. Move a task into this column.
                </li>
              )}
              {items.map((task) => {
                const priority = PRIORITY_META[task.priority];
                const prev = PREV[task.status];
                const next = NEXT[task.status];
                return (
                  <li key={task.id} className="rounded-lg border border-line bg-raised p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug">{task.title}</p>
                      <span
                        className="shrink-0 rounded-md px-2 py-0.5 text-xs font-medium"
                        style={{ background: `${priority.color}26`, color: priority.color === "#64748B" ? "#94A3B8" : priority.color }}
                      >
                        {priority.label}
                      </span>
                    </div>
                    {task.description && <p className="mt-1.5 text-xs leading-relaxed text-muted">{task.description}</p>}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex gap-1">
                        {prev && (
                          <button
                            onClick={() => onMove(task, prev)}
                            aria-label={`Move to ${STATUS_META[prev].label}`}
                            className="rounded-md p-1.5 text-muted transition-colors hover:bg-line hover:text-fg"
                          >
                            <ArrowLeft size={14} />
                          </button>
                        )}
                        {next && (
                          <button
                            onClick={() => onMove(task, next)}
                            aria-label={`Move to ${STATUS_META[next].label}`}
                            className="rounded-md p-1.5 text-muted transition-colors hover:bg-line hover:text-fg"
                          >
                            <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => onDelete(task)}
                        aria-label={`Delete ${task.title}`}
                        className="rounded-md p-1.5 text-muted transition-colors hover:bg-rose/15 hover:text-rose"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
