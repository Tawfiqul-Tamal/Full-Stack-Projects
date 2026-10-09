import type { Task, TaskPriority, TaskStatus } from "../types";

const DAY = 24 * 60 * 60 * 1000;

const TITLES: Array<[string, string]> = [
  ["Design database schema", "Model users, projects and tasks with indexes for common queries."],
  ["Set up CI pipeline", "Run typecheck, tests and build on every pull request."],
  ["Write API integration tests", "Cover happy paths and validation errors with supertest."],
  ["Build analytics dashboard", "KPI cards, trend chart and status breakdown."],
  ["Add request validation", "Validate every payload with zod and return field-level errors."],
  ["Implement rate limiting", "Protect the API from bursts of traffic."],
  ["Refactor error handling", "Centralise errors into a single Express middleware."],
  ["Write project README", "Architecture diagram, setup steps and API reference."],
  ["Optimise bundle size", "Audit client components and lazy-load heavy charts."],
  ["Add dark mode tokens", "Move colours into a single design token file."],
  ["Create Docker setup", "Multi-stage builds for api and web."],
  ["Add search and filters", "Query tasks by status, priority and free text."],
  ["Document REST endpoints", "Describe request and response shapes."],
  ["Review accessibility", "Keyboard focus, contrast and ARIA labels."],
  ["Plan sprint backlog", "Break the roadmap into week-sized chunks."],
  ["Set up logging", "Structured request logs with morgan."],
  ["Add authentication", "JWT access tokens with refresh rotation."],
  ["Deploy to production", "Ship web to Vercel and api to Render."],
  ["Benchmark API latency", "Measure p95 under 200 concurrent requests."],
  ["Write unit tests for stats", "Edge cases for empty data and day boundaries."],
  ["Improve empty states", "Give every empty column a clear next action."],
  ["Add drag and drop", "Move cards between columns with the pointer."],
  ["Audit dependencies", "Remove unused packages and pin versions."],
  ["Prepare demo video", "Two-minute walkthrough for the portfolio."],
];

// Small deterministic generator so the demo data looks the same on every start.
function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function buildSeed(now = Date.now()): Task[] {
  const rand = lcg(42);
  const priorities: TaskPriority[] = ["low", "medium", "high"];

  return TITLES.map(([title, description], i) => {
    const createdMs = now - Math.floor((i % 14) * DAY + rand() * 0.8 * DAY);
    const roll = rand();
    const status: TaskStatus = roll < 0.5 ? "done" : roll < 0.78 ? "in_progress" : "todo";
    const completedMs = Math.min(now, createdMs + Math.floor((0.4 + rand() * 2.5) * DAY));

    return {
      id: `seed-${String(i + 1).padStart(2, "0")}`,
      title,
      description,
      status,
      priority: priorities[Math.floor(rand() * 3)],
      createdAt: new Date(createdMs).toISOString(),
      completedAt: status === "done" ? new Date(completedMs).toISOString() : null,
    };
  });
}
