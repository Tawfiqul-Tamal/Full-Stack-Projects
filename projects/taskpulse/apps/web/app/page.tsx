"use client";

import { Activity, CheckCircle2, Gauge, ListTodo, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChartCard } from "@/components/ChartCard";
import { PriorityChart, StatusChart, TrendChart } from "@/components/Charts";
import { NewTaskDialog } from "@/components/NewTaskDialog";
import { StatCard } from "@/components/StatCard";
import { TaskBoard } from "@/components/TaskBoard";
import { api } from "@/lib/api";
import type { NewTask, Stats, Task, TaskStatus } from "@/lib/types";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [nextTasks, nextStats] = await Promise.all([api.tasks(), api.stats()]);
      setTasks(nextTasks);
      setStats(nextStats);
      setError(null);
    } catch {
      setError("Can't reach the API. Start it with `npm run dev:api` and refresh.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? tasks.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) : tasks;
  }, [tasks, query]);

  async function handleCreate(task: NewTask) {
    await api.create(task);
    await load();
  }

  async function handleMove(task: Task, status: TaskStatus) {
    await api.setStatus(task.id, status);
    await load();
  }

  async function handleDelete(task: Task) {
    await api.remove(task.id);
    await load();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">TaskPulse</h1>
          <p className="text-sm text-muted">Delivery trends and workload across your tasks.</p>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <label className="relative flex-1 sm:w-64">
            <span className="sr-only">Search tasks</span>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks"
              className="w-full rounded-lg border border-line bg-panel py-2 pl-9 pr-3 text-sm placeholder:text-muted"
            />
          </label>
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-soft"
          >
            <Plus size={16} aria-hidden /> New task
          </button>
        </div>
      </header>

      {error && (
        <p role="alert" className="mt-6 rounded-lg border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-rose">
          {error}
        </p>
      )}

      {!stats && !error && <p className="mt-10 text-sm text-muted">Loading dashboard…</p>}

      {stats && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total tasks" value={stats.total} hint="Across all columns" icon={ListTodo} accent="#818CF8" />
            <StatCard label="In progress" value={stats.byStatus.in_progress} hint="Currently being worked on" icon={Activity} accent="#F59E0B" />
            <StatCard label="Completed" value={stats.byStatus.done} hint="Marked as done" icon={CheckCircle2} accent="#22D3EE" />
            <StatCard label="Completion rate" value={`${stats.completionRate}%`} hint="Done out of total" icon={Gauge} accent="#F43F5E" />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-4">
            <ChartCard title="Created vs completed" subtitle="Last 14 days" className="lg:col-span-2">
              <TrendChart trend={stats.trend} />
            </ChartCard>
            <ChartCard title="Status" subtitle="Where work sits now">
              <StatusChart byStatus={stats.byStatus} total={stats.total} />
            </ChartCard>
            <ChartCard title="Priority" subtitle="How urgent the backlog is">
              <PriorityChart byPriority={stats.byPriority} />
            </ChartCard>
          </div>

          <div className="mb-3 mt-8">
            <h2 className="text-base font-semibold">Board</h2>
            <p className="text-sm text-muted">
              {query ? `${visible.length} tasks match “${query}”` : "Move tasks between columns as work progresses."}
            </p>
          </div>

          <div>
            <TaskBoard tasks={visible} onMove={handleMove} onDelete={handleDelete} />
          </div>
        </>
      )}

      {dialogOpen && <NewTaskDialog onClose={() => setDialogOpen(false)} onCreate={handleCreate} />}
    </main>
  );
}
