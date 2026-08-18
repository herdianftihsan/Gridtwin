import express, { type Express } from "express";

import { errorHandler, notFoundHandler } from "./middleware/error-handlers.js";
import { healthRouter } from "./routes/health.router.js";

/**
 * Builds the Express application without side effects.
 * Kept separate from the HTTP listener (src/index.ts) so the app
 * can be imported by tests without binding a port.
 */
export function createApp(): Express {
  const app = express();

  app.use(express.json());

  // Routers must be explicitly mounted on the app.
  app.use("/health", healthRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
