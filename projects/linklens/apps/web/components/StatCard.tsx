import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
  accent: string;
}

export function StatCard({ label, value, hint, icon: Icon, accent }: Props) {
  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <span className="rounded-lg p-2" style={{ background: `${accent}22`, color: accent }}>
          <Icon size={16} aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}
