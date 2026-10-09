"use client";

import { useEffect, useState } from "react";
import type { NewTask, TaskPriority } from "@/lib/types";

interface Props {
  onClose: () => void;
  onCreate: (task: NewTask) => Promise<void>;
}

export function NewTaskDialog({ onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      await onCreate({ title, description, priority });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the task");
      setSaving(false);
    }
  }

  const field = "w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm placeholder:text-muted";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-task-title"
        className="w-full max-w-md rounded-xl border border-line bg-panel p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="new-task-title" className="text-lg font-semibold">New task</h2>

        <div className="mt-4 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Title</span>
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className={field} placeholder="Write integration tests" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={field} placeholder="What needs to happen?" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Priority</span>
            <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className={field}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>

        {error && <p role="alert" className="mt-3 text-sm text-rose">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-muted transition-colors hover:text-fg">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="rounded-lg bg-indigo px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-soft disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create task"}
          </button>
        </div>
      </div>
    </div>
  );
}
