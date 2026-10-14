import { randomBytes, randomUUID } from "node:crypto";
import { config } from "../config";
import { AppError } from "../middleware/errors";
import type { CreateLinkInput } from "../schemas";
import type { Database } from "../store/database";
import type { Analytics, Click, Device, Link, LinkView } from "../types";

const DAY = 24 * 60 * 60 * 1000;
const dayKey = (date: Date | string | number) => new Date(date).toISOString().slice(0, 10);

export function deviceOf(userAgent = ""): Device {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "Tablet";
  if (/mobi|android|iphone/.test(ua)) return "Mobile";
  return "Desktop";
}

export function referrerOf(referer?: string): string {
  if (!referer) return "Direct";
  try {
    return new URL(referer).hostname.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
}

export class LinkService {
  constructor(private readonly db: Database) {}

  create(userId: string, input: CreateLinkInput): Link {
    const code = input.alias ?? this.uniqueCode();
    if (this.db.links.some((l) => l.code === code)) {
      throw new AppError(409, "That alias is already taken. Try another one");
    }
    const link: Link = { id: randomUUID(), userId, code, url: input.url, createdAt: new Date().toISOString() };
    this.db.links.push(link);
    this.db.save();
    return link;
  }

  list(userId: string): LinkView[] {
    const counts = new Map<string, number>();
    for (const click of this.db.clicks) counts.set(click.linkId, (counts.get(click.linkId) ?? 0) + 1);

    return this.db.links
      .filter((l) => l.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((l) => ({
        id: l.id,
        code: l.code,
        url: l.url,
        shortUrl: `${config.baseUrl}/r/${l.code}`,
        createdAt: l.createdAt,
        clicks: counts.get(l.id) ?? 0,
      }));
  }

  remove(userId: string, id: string) {
    const index = this.db.links.findIndex((l) => l.id === id && l.userId === userId);
    if (index === -1) throw new AppError(404, "Link not found");
    this.db.links.splice(index, 1);
    this.db.clicks = this.db.clicks.filter((c) => c.linkId !== id);
    this.db.save();
  }

  /** Looks up a short code and records the visit. */
  resolve(code: string, meta: { userAgent?: string; referer?: string }): Link | undefined {
    const link = this.db.links.find((l) => l.code === code);
    if (!link) return undefined;
    this.db.clicks.push({
      id: randomUUID(),
      linkId: link.id,
      at: new Date().toISOString(),
      device: deviceOf(meta.userAgent),
      referrer: referrerOf(meta.referer),
    });
    this.db.save();
    return link;
  }

  analytics(userId: string, days = 14, now = Date.now()): Analytics {
    const links = this.db.links.filter((l) => l.userId === userId);
    const ids = new Set(links.map((l) => l.id));
    const clicks = this.db.clicks.filter((c) => ids.has(c.linkId));

    const byDay = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) byDay.set(dayKey(now - i * DAY), 0);

    const byDevice: Record<Device, number> = { Desktop: 0, Mobile: 0, Tablet: 0 };
    const referrers = new Map<string, number>();
    const perLink = new Map<string, number>();

    for (const click of clicks) {
      const key = dayKey(click.at);
      if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1);
      byDevice[click.device] += 1;
      referrers.set(click.referrer, (referrers.get(click.referrer) ?? 0) + 1);
      perLink.set(click.linkId, (perLink.get(click.linkId) ?? 0) + 1);
    }

    const series = [...byDay.entries()].map(([date, count]) => ({ date, clicks: count }));

    return {
      totalLinks: links.length,
      totalClicks: clicks.length,
      clicksToday: series[series.length - 1]?.clicks ?? 0,
      byDay: series,
      byDevice,
      topReferrers: [...referrers.entries()]
        .map(([name, count]) => ({ name, clicks: count }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5),
      topLinks: links
        .map((l) => ({ code: l.code, url: l.url, clicks: perLink.get(l.id) ?? 0 }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5),
    };
  }

  /** Creates sample links with two weeks of clicks so a new account has data to explore. */
  seedDemo(userId: string, now = Date.now()) {
    const samples: Array<[string, string]> = [
      ["docs", "https://developer.mozilla.org/en-US/docs/Web/JavaScript"],
      ["repo", "https://github.com/vercel/next.js"],
      ["blog", "https://nodejs.org/en/blog"],
      ["portfolio", "https://example.com/portfolio"],
      ["resume", "https://example.com/resume.pdf"],
    ];
    const referrers = ["Direct", "google.com", "linkedin.com", "github.com", "x.com", "reddit.com"];

    let seed = 7;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    samples.forEach(([name, url], index) => {
      const link = this.create(userId, { url, alias: `${name}-${randomBytes(2).toString("hex")}` });
      const total = 25 + Math.floor(rand() * 60) - index * 4;
      const clicks: Click[] = [];
      for (let i = 0; i < total; i++) {
        const dayOffset = Math.floor(Math.pow(rand(), 1.6) * 14);
        const roll = rand();
        clicks.push({
          id: randomUUID(),
          linkId: link.id,
          at: new Date(now - dayOffset * DAY - Math.floor(rand() * DAY * 0.95)).toISOString(),
          device: roll < 0.55 ? "Desktop" : roll < 0.92 ? "Mobile" : "Tablet",
          referrer: referrers[Math.floor(Math.pow(rand(), 1.8) * referrers.length)],
        });
      }
      this.db.clicks.push(...clicks);
    });
    this.db.save();
  }

  private uniqueCode(): string {
    for (;;) {
      const code = randomBytes(6).toString("base64url").slice(0, 7);
      if (!this.db.links.some((l) => l.code === code)) return code;
    }
  }
}
