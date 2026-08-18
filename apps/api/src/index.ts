import "dotenv/config";

import { createApp } from "./app.js";

const DEFAULT_PORT = 4000;

function resolvePort(): number {
  const raw = process.env.PORT;
  if (raw === undefined) return DEFAULT_PORT;

  const port = Number(raw);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT value: ${raw}`);
  }
  return port;
}

const port = resolvePort();
const app = createApp();

app.listen(port, () => {
  console.log(`[gridtwin-api] listening on http://localhost:${port}`);
});
