import type { RequestHandler } from "express";
import type { AuthService } from "../services/authService";
import { AppError } from "./errors";

export const requireAuth =
  (auth: AuthService): RequestHandler =>
  (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new AppError(401, "Sign in to continue");

    const userId = auth.verify(header.slice(7));
    if (!auth.findById(userId)) throw new AppError(401, "Your account no longer exists");

    res.locals.userId = userId;
    next();
  };
