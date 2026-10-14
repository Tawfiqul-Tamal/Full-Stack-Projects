import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config";
import { requireAuth } from "./middleware/auth";
import { AppError, errorHandler, notFound } from "./middleware/errors";
import { createAuthRouter } from "./routes/auth";
import { createLinkRouter } from "./routes/links";
import { AuthService } from "./services/authService";
import { LinkService } from "./services/linkService";
import { Database } from "./store/database";

export function createApp(db: Database = new Database(config.dataFile)) {
  const app = express();
  const auth = new AuthService(db);
  const links = new LinkService(db);

  app.use(helmet());
  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json({ limit: "10kb" }));
  if (config.nodeEnv !== "test") app.use(morgan("dev"));

  app.use("/api", rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: true, legacyHeaders: false }));
  const authLimiter = rateLimit({
    windowMs: 15 * 60_000,
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts. Try again in a few minutes" },
  });
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: Math.round(process.uptime()) });
  });
  app.use("/api/auth", createAuthRouter(auth));
  app.use("/api/links", createLinkRouter(auth, links));
  app.get("/api/analytics", requireAuth(auth), (_req, res) => {
    res.json(links.analytics(res.locals.userId));
  });

  // Public redirect: records the visit, then sends the visitor on.
  app.get("/r/:code", (req, res) => {
    const link = links.resolve(req.params.code, {
      userAgent: req.headers["user-agent"],
      referer: req.headers.referer,
    });
    if (!link) throw new AppError(404, "This short link does not exist");
    res.redirect(302, link.url);
  });

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
