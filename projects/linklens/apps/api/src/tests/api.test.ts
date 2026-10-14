import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { deviceOf, referrerOf } from "../services/linkService";
import { Database } from "../store/database";

const freshApp = () => createApp(new Database());

async function signUp(app: ReturnType<typeof freshApp>, email = "ada@example.com") {
  const res = await request(app).post("/api/auth/register").send({ name: "Ada Lovelace", email, password: "supersecret1" });
  return res.body.token as string;
}

describe("auth", () => {
  it("registers a user and returns a token without the password hash", async () => {
    const res = await request(freshApp())
      .post("/api/auth/register")
      .send({ name: "Ada Lovelace", email: "ada@example.com", password: "supersecret1" });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTypeOf("string");
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("rejects a duplicate email", async () => {
    const app = freshApp();
    await signUp(app);
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Ada Again", email: "ada@example.com", password: "supersecret1" });
    expect(res.status).toBe(409);
  });

  it("rejects a wrong password", async () => {
    const app = freshApp();
    await signUp(app);
    const res = await request(app).post("/api/auth/login").send({ email: "ada@example.com", password: "wrong-password" });
    expect(res.status).toBe(401);
  });

  it("blocks protected routes without a token", async () => {
    const res = await request(freshApp()).get("/api/links");
    expect(res.status).toBe(401);
  });
});

describe("links and analytics", () => {
  it("creates a link, redirects and counts the click", async () => {
    const app = freshApp();
    const token = await signUp(app);
    const auth = { Authorization: `Bearer ${token}` };

    const created = await request(app).post("/api/links").set(auth).send({ url: "https://example.com", alias: "demo" });
    expect(created.status).toBe(201);
    expect(created.body.shortUrl).toMatch(/\/r\/demo$/);

    const redirect = await request(app).get("/r/demo").set("Referer", "https://www.google.com/search");
    expect(redirect.status).toBe(302);
    expect(redirect.headers.location).toBe("https://example.com");

    const analytics = await request(app).get("/api/analytics").set(auth);
    expect(analytics.body.totalClicks).toBe(1);
    expect(analytics.body.topReferrers[0]).toEqual({ name: "google.com", clicks: 1 });
  });

  it("rejects a taken alias and an invalid URL", async () => {
    const app = freshApp();
    const auth = { Authorization: `Bearer ${await signUp(app)}` };
    await request(app).post("/api/links").set(auth).send({ url: "https://example.com", alias: "taken" });

    const duplicate = await request(app).post("/api/links").set(auth).send({ url: "https://example.org", alias: "taken" });
    expect(duplicate.status).toBe(409);

    const invalid = await request(app).post("/api/links").set(auth).send({ url: "not-a-url" });
    expect(invalid.status).toBe(400);
  });

  it("keeps each user's links private", async () => {
    const app = freshApp();
    const first = { Authorization: `Bearer ${await signUp(app, "one@example.com")}` };
    const second = { Authorization: `Bearer ${await signUp(app, "two@example.com")}` };

    const created = await request(app).post("/api/links").set(first).send({ url: "https://example.com" });
    const list = await request(app).get("/api/links").set(second);
    expect(list.body).toHaveLength(0);

    const remove = await request(app).delete(`/api/links/${created.body.id}`).set(second);
    expect(remove.status).toBe(404);
  });

  it("returns 404 for unknown short codes", async () => {
    const res = await request(freshApp()).get("/r/missing");
    expect(res.status).toBe(404);
  });
});

describe("request helpers", () => {
  it("detects devices and referrers", () => {
    expect(deviceOf("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile")).toBe("Mobile");
    expect(deviceOf("Mozilla/5.0 (Windows NT 10.0)")).toBe("Desktop");
    expect(referrerOf(undefined)).toBe("Direct");
    expect(referrerOf("https://www.linkedin.com/feed")).toBe("linkedin.com");
  });
});
