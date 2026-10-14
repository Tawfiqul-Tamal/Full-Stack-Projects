"use client";

import { Check, Copy, ExternalLink, Trash2 } from "lucide-react";
import { useState } from "react";
import type { LinkView } from "@/lib/types";

interface Props {
  links: LinkView[];
  onDelete: (link: LinkView) => void;
  onLoadDemo: () => void;
}

export function LinkTable({ links, onDelete, onLoadDemo }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(link: LinkView) {
    try {
      await navigator.clipboard.writeText(link.shortUrl);
      setCopied(link.id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      window.prompt("Copy this link", link.shortUrl);
    }
  }

  if (links.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-panel p-10 text-center">
        <p className="font-medium">No links yet</p>
        <p className="mt-1 text-sm text-muted">Shorten your first link above, or fill the dashboard with sample data.</p>
        <button
          onClick={onLoadDemo}
          className="mt-4 rounded-lg border border-line px-4 py-2 text-sm transition-colors hover:bg-raised"
        >
          Load sample data
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-panel">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line text-muted">
          <tr>
            <th className="px-5 py-3 font-medium">Short link</th>
            <th className="px-5 py-3 font-medium">Destination</th>
            <th className="px-5 py-3 text-right font-medium">Clicks</th>
            <th className="px-5 py-3 font-medium">Created</th>
            <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr key={link.id} className="border-b border-line last:border-0">
              <td className="px-5 py-3">
                <span className="font-medium text-accent">/r/{link.code}</span>
              </td>
              <td className="max-w-[280px] truncate px-5 py-3 text-muted" title={link.url}>{link.url}</td>
              <td className="px-5 py-3 text-right font-semibold tabular-nums">{link.clicks}</td>
              <td className="whitespace-nowrap px-5 py-3 text-muted">
                {new Date(link.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => copy(link)}
                    aria-label={`Copy short link ${link.code}`}
                    className="rounded-md p-2 text-muted transition-colors hover:bg-raised hover:text-fg"
                  >
                    {copied === link.id ? <Check size={15} className="text-accent" /> : <Copy size={15} />}
                  </button>
                  <a
                    href={link.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open short link ${link.code}`}
                    className="rounded-md p-2 text-muted transition-colors hover:bg-raised hover:text-fg"
                  >
                    <ExternalLink size={15} />
                  </a>
                  <button
                    onClick={() => onDelete(link)}
                    aria-label={`Delete link ${link.code}`}
                    className="rounded-md p-2 text-muted transition-colors hover:bg-coral/15 hover:text-coral"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
