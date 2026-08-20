import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config/env.js';
import { healthRouter } from './routes/health.router.js';
import { projectRouter } from './routes/project.routes.js';
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
  app.use('/api/health', healthRouter);
  app.use('/api/projects', projectRouter);

  // 404 Route Catcher
  app.use((_req, _res, next) => {
    next(new NotFoundError('The requested resource was not found.'));
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};