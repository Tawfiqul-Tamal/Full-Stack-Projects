import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { computeStats } from "../services/statsService";
import { TaskStore } from "../store/taskStore";

const freshApp = () => createApp(new TaskStore());

describe("tasks API", () => {
  it("creates a task with defaults", async () => {
    const res = await request(freshApp()).post("/api/tasks").send({ title: "Write tests" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ status: "todo", priority: "medium", completedAt: null });
  });

  it("rejects an invalid payload with a readable message", async () => {
    const res = await request(freshApp()).post("/api/tasks").send({ title: "x" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least 3/);
  });

  it("sets completedAt when a task moves to done", async () => {
    const app = freshApp();
    const created = await request(app).post("/api/tasks").send({ title: "Ship v1" });
    const res = await request(app).patch(`/api/tasks/${created.body.id}`).send({ status: "done" });
    expect(res.status).toBe(200);
    expect(res.body.completedAt).not.toBeNull();
  });

  it("returns 404 for unknown tasks", async () => {
    const res = await request(freshApp()).delete("/api/tasks/nope");
    expect(res.status).toBe(404);
  });
});

describe("stats", () => {
  it("handles empty data", () => {
    const stats = computeStats([]);
    expect(stats.total).toBe(0);
    expect(stats.completionRate).toBe(0);
    expect(stats.trend).toHaveLength(14);
  });

  it("calculates completion rate", () => {
    const store = new TaskStore();
    store.create({ title: "One", description: "", priority: "low", status: "done" });
    store.create({ title: "Two", description: "", priority: "low", status: "todo" });
    expect(computeStats(store.list()).completionRate).toBe(50);
  });
});
