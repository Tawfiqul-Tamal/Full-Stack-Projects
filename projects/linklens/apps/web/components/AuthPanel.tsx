"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { Session } from "@/lib/types";

export function AuthPanel({ onAuth }: { onAuth: (session: Session) => void }) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = mode === "register" ? await api.register(name, email, password) : await api.login(email, password);
      onAuth(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  const input = "w-full rounded-lg border border-line bg-abyss px-3 py-2.5 text-sm placeholder:text-muted";

  return (
    <main className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-2">
      <section>
        <h1 className="text-5xl font-semibold tracking-tight">LinkLens</h1>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
          Shorten a link, share it anywhere, and see how many people opened it, where they came from and what device they used.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-muted">
          <li>Custom aliases for links you want to remember</li>
          <li>Daily clicks, devices and top referrers on one screen</li>
          <li>Your links and numbers stay private to your account</li>
        </ul>
      </section>

      <form onSubmit={submit} className="rounded-2xl border border-line bg-panel p-7">
        <div className="mb-6 flex gap-1 rounded-lg bg-abyss p-1 text-sm" role="tablist">
          {(["register", "login"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              onClick={() => { setMode(value); setError(null); }}
              className={`flex-1 rounded-md py-2 font-medium transition-colors ${mode === value ? "bg-raised text-fg" : "text-muted hover:text-fg"}`}
            >
              {value === "register" ? "Create account" : "Sign in"}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {mode === "register" && (
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={input} placeholder="Ada Lovelace" />
            </label>
          )}
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={input} placeholder="you@example.com" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              className={input}
              placeholder="At least 8 characters"
            />
          </label>
        </div>

        {error && <p role="alert" className="mt-4 text-sm text-coral">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-abyss transition-colors hover:bg-accent-dark disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
