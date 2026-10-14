"use client";

import { CalendarClock, LogOut, MousePointerClick, Link2, Smartphone } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ChartCard, EmptyChart } from "@/components/ChartCard";
import { ClicksChart, DeviceChart, ReferrerChart } from "@/components/Charts";
import { CreateLinkForm } from "@/components/CreateLinkForm";
import { LinkTable } from "@/components/LinkTable";
import { StatCard } from "@/components/StatCard";
import { api, ApiError } from "@/lib/api";
import type { Analytics, LinkView, User } from "@/lib/types";

interface Props {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: Props) {
  const [links, setLinks] = useState<LinkView[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [nextLinks, nextAnalytics] = await Promise.all([api.links(), api.analytics()]);
      setLinks(nextLinks);
      setAnalytics(nextAnalytics);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return onLogout();
      setError(err instanceof Error ? err.message : "Could not load your data");
    }
  }, [onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  const act = (fn: () => Promise<unknown>) => async () => {
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const topDevice = analytics
    ? (Object.entries(analytics.byDevice).sort((a, b) => b[1] - a[1])[0] ?? ["None", 0])
    : ["None", 0];
  const hasClicks = (analytics?.totalClicks ?? 0) > 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">LinkLens</h1>
          <p className="text-sm text-muted">Signed in as {user.name}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm text-muted transition-colors hover:bg-raised hover:text-fg"
        >
          <LogOut size={15} aria-hidden /> Sign out
        </button>
      </header>

      {error && (
        <p role="alert" className="mt-6 rounded-lg border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
          {error}
        </p>
      )}

      <div className="mt-6">
        <CreateLinkForm onCreate={async (url, alias) => { await api.createLink(url, alias); await load(); }} />
      </div>

      {analytics && (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Links" value={analytics.totalLinks} hint="Created so far" icon={Link2} accent="#2DD4BF" />
            <StatCard label="Total clicks" value={analytics.totalClicks} hint="Across all links" icon={MousePointerClick} accent="#38BDF8" />
            <StatCard label="Clicks today" value={analytics.clicksToday} hint="Since midnight UTC" icon={CalendarClock} accent="#FBBF24" />
            <StatCard label="Top device" value={hasClicks ? String(topDevice[0]) : "None yet"} hint="Most clicks come from here" icon={Smartphone} accent="#FB7185" />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-4">
            <ChartCard title="Clicks per day" subtitle="Last 14 days" className="lg:col-span-2">
              {hasClicks ? <ClicksChart byDay={analytics.byDay} /> : <EmptyChart message="No clicks yet. Open one of your short links and it will show up here." />}
            </ChartCard>
            <ChartCard title="Devices" subtitle="What visitors use">
              {hasClicks ? <DeviceChart byDevice={analytics.byDevice} total={analytics.totalClicks} /> : <EmptyChart message="Device data appears after the first click." />}
            </ChartCard>
            <ChartCard title="Top referrers" subtitle="Where visitors come from">
              {hasClicks ? <ReferrerChart referrers={analytics.topReferrers} /> : <EmptyChart message="Referrer data appears after the first click." />}
            </ChartCard>
          </div>

          <div className="mb-3 mt-8">
            <h2 className="text-base font-semibold">Your links</h2>
            <p className="text-sm text-muted">Copy a short link, open it, or delete it with its click history.</p>
          </div>
          <LinkTable
            links={links}
            onDelete={(link) => act(() => api.removeLink(link.id))()}
            onLoadDemo={act(() => api.loadDemo())}
          />
        </>
      )}
    </main>
  );
}
