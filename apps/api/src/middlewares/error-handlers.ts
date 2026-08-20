// apps/api/src/middlewares/error-handlers.ts
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError, ApiErrorEnvelope } from '../utils/errors.js';
import { SimulationDomainError } from '../simulation/errors.js';
import { OptimizationDomainError } from '../optimization/errors.js';
import { logger } from '../utils/logger.js';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response<ApiErrorEnvelope>,
  _next: NextFunction
): void => {
  const requestId = (req.headers['x-request-id'] as string) || 'unknown';

  // 1. Handled App Errors
  if (err instanceof AppError) {
    logger.warn(`Application error [${err.code}]: ${err.message}`, {
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

  // 2. Request Validation Errors (Zod)
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const path = issue.path.join('.') || 'body';
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    }

    logger.warn('Request validation error', { requestId, validationErrors: fieldErrors });

    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data.',
        details: fieldErrors,
      },
    });
    return;
  }

  // 3. Simulation Domain Errors
  if (err instanceof SimulationDomainError) {
    logger.warn(`Simulation domain error [${err.code}]: ${err.message}`, {
      requestId,
      code: err.code,
      details: err.details,
    });

    const statusCode = err.code === 'INFEASIBLE_EFFICIENCY_CONFIGURATION' ? 400 : 400;

    res.status(statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // 4. Optimization Domain Errors
  if (err instanceof OptimizationDomainError) {
    logger.warn(`Optimization domain error [${err.code}]: ${err.message}`, {
      requestId,
      code: err.code,
      details: err.details,
    });

    const statusCode = err.code === 'NO_FEASIBLE_SCENARIO' ? 422 : 400;

    res.status(statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // 5. Unhandled Server Errors
  logger.error('Unhandled internal server error', err, { requestId, path: req.originalUrl });

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected internal error occurred.',
      details: {},
    },
  });
};