"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthPanel } from "@/components/AuthPanel";
import { Dashboard } from "@/components/Dashboard";
import { api, tokenStore } from "@/lib/api";
import type { Session, User } from "@/lib/types";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    async function restore() {
      if (!tokenStore.get()) return setBooting(false);
      try {
        setUser(await api.me());
      } catch {
        tokenStore.clear();
      } finally {
        setBooting(false);
      }
    }
    restore();
  }, []);

  const handleAuth = useCallback((session: Session) => {
    tokenStore.set(session.token);
    setUser(session.user);
  }, []);

  const handleLogout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  if (booting) return <p className="p-10 text-sm text-muted">Loading…</p>;
  if (!user) return <AuthPanel onAuth={handleAuth} />;
  return <Dashboard user={user} onLogout={handleLogout} />;
}
