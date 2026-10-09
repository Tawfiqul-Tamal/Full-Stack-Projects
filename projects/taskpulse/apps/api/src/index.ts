import { createApp } from "./app";
import { config } from "./config";

createApp().listen(config.port, () => {
  console.log(`TaskPulse API listening on http://localhost:${config.port}/api`);
});
