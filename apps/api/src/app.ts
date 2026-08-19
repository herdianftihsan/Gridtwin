import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config/env.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler } from '../src/middlewares/error-handlers.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { healthRouter } from '../src/routes/health.router.js';
~
export const createApp = (): Express => {
  const app = express();

  // Security headers & CORS
  app.use(helmet());
  app.use(
    cors({
      origin: config.CORS_ORIGIN === '*' ? '*' : config.CORS_ORIGIN.split(','),
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    })
  );

  // Request limits & parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Observability
  app.use(requestLogger);

  // Routes
  app.use('/api', healthRouter);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};