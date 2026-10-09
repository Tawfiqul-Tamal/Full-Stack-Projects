import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config";
import { errorHandler, notFound } from "./middleware/errors";
import { createTaskRouter } from "./routes/tasks";
import { computeStats } from "./services/statsService";
import { buildSeed } from "./store/seed";
import { TaskStore } from "./store/taskStore";

export function createApp(store: TaskStore = new TaskStore(buildSeed())) {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json({ limit: "10kb" }));
  if (config.nodeEnv !== "test") app.use(morgan("dev"));
  app.use("/api", rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: true, legacyHeaders: false }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: Math.round(process.uptime()) });
  });
  app.use("/api/tasks", createTaskRouter(store));
  app.get("/api/stats", (_req, res) => {
    res.json(computeStats(store.list()));
  });

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
