import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError, ApiErrorEnvelope } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response<ApiErrorEnvelope>,
  _next: NextFunction
): void => {
  const requestId = (req.headers['x-request-id'] as string) || 'unknown';

  if (err instanceof AppError) {
    logger.warn(`Handled application error [${err.code}]: ${err.message}`, {
      requestId,
      code: err.code,
      statusCode: err.statusCode,
      details: err.details,
    });

    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const path = issue.path.join('.') || 'body';
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    }

    logger.warn('Request validation error', {
      requestId,
      validationErrors: fieldErrors,
    });

    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data.',
        details: fieldErrors,
      },
    });
    return;
  }

  logger.error('Unhandled server error', err, { requestId, path: req.originalUrl });

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected internal error occurred.',
      details: {},
    },
  });
};