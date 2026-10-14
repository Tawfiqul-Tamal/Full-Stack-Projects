import fs from "node:fs";
import path from "node:path";
import type { Click, Link, User } from "../types";

/**
 * Tiny JSON-file database. Data is kept in memory and written to disk shortly
 * after every change. Services only talk to this class, so it can be replaced
 * by PostgreSQL or MongoDB without touching routes or business logic.
 */
export class Database {
  users: User[] = [];
  links: Link[] = [];
  clicks: Click[] = [];
  private timer?: NodeJS.Timeout;

  constructor(private readonly filePath?: string) {
    if (filePath && fs.existsSync(filePath)) {
      const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
      this.users = raw.users ?? [];
      this.links = raw.links ?? [];
      this.clicks = raw.clicks ?? [];
    }
  }

  save() {
    if (!this.filePath) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 300);
    this.timer.unref?.();
  }

  flush() {
    if (!this.filePath) return;
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(
      this.filePath,
      JSON.stringify({ users: this.users, links: this.links, clicks: this.clicks }),
    );
  }
}
