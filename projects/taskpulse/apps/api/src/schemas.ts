import { z } from "zod";

export const statusSchema = z.enum(["todo", "in_progress", "done"]);
export const prioritySchema = z.enum(["low", "medium", "high"]);

const fields = {
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().trim().max(500),
  priority: prioritySchema,
  status: statusSchema,
};

export const createTaskSchema = z.object({
  title: fields.title,
  description: fields.description.default(""),
  priority: fields.priority.default("medium"),
  status: fields.status.default("todo"),
});

export const updateTaskSchema = z
  .object(fields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  });

export const listQuerySchema = z.object({
  status: statusSchema.optional(),
  priority: prioritySchema.optional(),
  q: z.string().trim().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
