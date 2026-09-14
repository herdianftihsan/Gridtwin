import { createApp } from './app.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';

const app = createApp();

const server = app.listen(config.PORT, () => {
  logger.info(`GridTwin AI Server initialized on port ${config.PORT} [${config.NODE_ENV}]`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${config.PORT} is already occupied. An API instance might already be running.`);
    process.exit(1);
  } else {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
});

const gracefulShutdown = (signal: string): void => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    logger.info('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forcefully terminating process due to shutdown timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));