import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { createLinkSchema } from "../schemas";
import type { AuthService } from "../services/authService";
import type { LinkService } from "../services/linkService";

export function createLinkRouter(auth: AuthService, links: LinkService) {
  const router = Router();
  router.use(requireAuth(auth));

  router.get("/", (_req, res) => {
    res.json(links.list(res.locals.userId));
  });

  router.post("/", (req, res) => {
    const input = createLinkSchema.parse(req.body);
    const link = links.create(res.locals.userId, input);
    const view = links.list(res.locals.userId).find((l) => l.id === link.id);
    res.status(201).json(view);
  });

  router.post("/demo", (_req, res) => {
    links.seedDemo(res.locals.userId);
    res.status(201).json(links.list(res.locals.userId));
  });

  router.delete("/:id", (req, res) => {
    links.remove(res.locals.userId, req.params.id);
    res.status(204).send();
  });

  return router;
}
