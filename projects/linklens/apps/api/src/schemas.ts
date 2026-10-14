import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

const httpUrl = z
  .string()
  .trim()
  .url("Enter a full URL, for example https://example.com")
  .refine((value) => /^https?:\/\//i.test(value), "Only http and https links are supported");

export const createLinkSchema = z.object({
  url: httpUrl,
  alias: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_-]{3,30}$/, "Alias must be 3-30 characters: letters, numbers, - or _")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateLinkInput = z.infer<typeof createLinkSchema>;
