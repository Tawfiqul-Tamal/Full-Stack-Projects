import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { AppError } from "../middleware/errors";
import type { LoginInput, RegisterInput } from "../schemas";
import type { Database } from "../store/database";
import type { PublicUser, User } from "../types";

export const toPublicUser = ({ passwordHash: _hash, ...user }: User): PublicUser => user;

export class AuthService {
  constructor(private readonly db: Database) {}

  async register(input: RegisterInput) {
    if (this.db.users.some((u) => u.email === input.email)) {
      throw new AppError(409, "An account with this email already exists");
    }
    const user: User = {
      id: randomUUID(),
      name: input.name,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 10),
      createdAt: new Date().toISOString(),
    };
    this.db.users.push(user);
    this.db.save();
    return this.session(user);
  }

  async login(input: LoginInput) {
    const user = this.db.users.find((u) => u.email === input.email);
    const valid = user ? await bcrypt.compare(input.password, user.passwordHash) : false;
    if (!user || !valid) throw new AppError(401, "Email or password is incorrect");
    return this.session(user);
  }

  verify(token: string): string {
    try {
      const payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
      if (typeof payload.sub !== "string") throw new Error("Missing subject");
      return payload.sub;
    } catch {
      throw new AppError(401, "Your session has expired. Please sign in again");
    }
  }

  findById(id: string): User | undefined {
    return this.db.users.find((u) => u.id === id);
  }

  private session(user: User) {
    const token = jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: "7d" });
    return { token, user: toPublicUser(user) };
  }
}
