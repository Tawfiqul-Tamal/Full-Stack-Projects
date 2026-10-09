import { Router } from "express";
import { AppError } from "../middleware/errors";
import { createTaskSchema, listQuerySchema, updateTaskSchema } from "../schemas";
import type { TaskStore } from "../store/taskStore";

export function createTaskRouter(store: TaskStore) {
  const router = Router();

  router.get("/", (req, res) => {
    const filter = listQuerySchema.parse(req.query);
    res.json(store.list(filter));
  });

  router.get("/:id", (req, res) => {
    const task = store.get(req.params.id);
    if (!task) throw new AppError(404, "Task not found");
    res.json(task);
  });

  router.post("/", (req, res) => {
    const input = createTaskSchema.parse(req.body);
    res.status(201).json(store.create(input));
  });

  router.patch("/:id", (req, res) => {
    const patch = updateTaskSchema.parse(req.body);
    const task = store.update(req.params.id, patch);
    if (!task) throw new AppError(404, "Task not found");
    res.json(task);
  });

  router.delete("/:id", (req, res) => {
    if (!store.remove(req.params.id)) throw new AppError(404, "Task not found");
    res.status(204).send();
  });

  return router;
}
