import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler, AppError } from "../middleware/errors";
import { loginSchema, registerSchema } from "../schemas";
import { toPublicUser, type AuthService } from "../services/authService";

export function createAuthRouter(auth: AuthService) {
  const router = Router();

  router.post(
    "/register",
    asyncHandler(async (req, res) => {
      res.status(201).json(await auth.register(registerSchema.parse(req.body)));
    }),
  );

  router.post(
    "/login",
    asyncHandler(async (req, res) => {
      res.json(await auth.login(loginSchema.parse(req.body)));
    }),
  );

  router.get("/me", requireAuth(auth), (_req, res) => {
    const user = auth.findById(res.locals.userId);
    if (!user) throw new AppError(401, "Your account no longer exists");
    res.json(toPublicUser(user));
  });

  return router;
}
