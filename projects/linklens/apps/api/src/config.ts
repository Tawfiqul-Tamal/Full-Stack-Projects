import "dotenv/config";
import path from "node:path";

const nodeEnv = process.env.NODE_ENV ?? "development";

if (nodeEnv === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in production");
}

export const config = {
  nodeEnv,
  port: Number(process.env.PORT ?? 4001),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3001",
  baseUrl: process.env.BASE_URL ?? "http://localhost:4001",
  jwtSecret: process.env.JWT_SECRET ?? "dev-only-secret-change-me",
  dataFile: nodeEnv === "test" ? undefined : path.resolve(process.cwd(), "data/db.json"),
};
