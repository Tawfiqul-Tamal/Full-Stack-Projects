export function ChartCard({
  title,
  subtitle,
  className = "",
  children,
}: {
  title: string;
  subtitle: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-xl border border-line bg-panel p-5 ${className}`}>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mb-4 text-sm text-muted">{subtitle}</p>
      {children}
    </section>
  );
}

export function EmptyChart({ message }: { message: string }) {
  return (
    <div className="grid h-[220px] place-items-center rounded-lg border border-dashed border-line px-6 text-center text-sm text-muted">
      {message}
    </div>
  );
}
