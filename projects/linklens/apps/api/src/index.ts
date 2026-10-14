import { createApp } from "./app";
import { config } from "./config";
import { Database } from "./store/database";

const db = new Database(config.dataFile);

createApp(db).listen(config.port, () => {
  console.log(`LinkLens API listening on http://localhost:${config.port}/api`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    db.flush();
    process.exit(0);
  });
}
