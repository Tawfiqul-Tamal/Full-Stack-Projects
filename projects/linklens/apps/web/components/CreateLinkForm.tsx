"use client";

import { Link2 } from "lucide-react";
import { useState } from "react";

export function CreateLinkForm({ onCreate }: { onCreate: (url: string, alias: string) => Promise<void> }) {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onCreate(url, alias);
      setUrl("");
      setAlias("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the link");
    } finally {
      setBusy(false);
    }
  }

  const input = "rounded-lg border border-line bg-abyss px-3 py-2.5 text-sm placeholder:text-muted";

  return (
    <form onSubmit={submit} className="rounded-xl border border-line bg-panel p-5">
      <div className="flex flex-col gap-3 md:flex-row">
        <label className="flex-1">
          <span className="sr-only">Destination URL</span>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/a-very-long-link" className={`${input} w-full`} />
        </label>
        <label className="md:w-56">
          <span className="sr-only">Custom alias (optional)</span>
          <input value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="Custom alias (optional)" className={`${input} w-full`} />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-abyss transition-colors hover:bg-accent-dark disabled:opacity-60"
        >
          <Link2 size={16} aria-hidden /> {busy ? "Shortening…" : "Shorten link"}
        </button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-coral">{error}</p>}
    </form>
  );
}
