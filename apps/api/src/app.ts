// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./types/express.d.ts" />
import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config/env.js';
import { healthRouter } from './routes/health.router.js';
import { projectRouter } from './routes/project.routes.js';
import { scenarioRouter } from './routes/scenario.routes.js';
import { aiRouter } from './routes/ai.routes.js';
import { locationRouter } from './routes/location.routes.js';
import { errorHandler } from './middlewares/error-handlers.js';
import { NotFoundError } from './utils/errors.js';

export const createApp = (): Express => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: config.FRONTEND_URL,
      credentials: true,
    })
  );
  app.use(express.json());

  // Mount API Endpoints
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/api/health', healthRouter);
  app.use('/api/projects', projectRouter);
  app.use('/api/scenarios', scenarioRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/locations', locationRouter);

  // 404 Route Catcher
  app.use((_req, _res, next) => {
    next(new NotFoundError('The requested resource was not found.'));
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};