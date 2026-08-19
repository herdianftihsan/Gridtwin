// src/app.ts
import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config/env.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler } from '../src/middlewares/error-handlers.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { healthRouter } from '../src/routes/health.router.js';

export const createApp = (): Express => {
  const app = express();

  // Security headers & CORS
  app.use(helmet());
  app.use(
    cors({
      origin: config.FRONTEND_URL === '*' ? '*' : config.FRONTEND_URL.split(','),
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    })
  );

  // Body parser with size limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Request tracing & logging
  app.use(requestLogger);

  // Base API routes
  app.use('/api', healthRouter);

  // 404 & Centralized Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};