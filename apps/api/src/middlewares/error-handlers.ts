// apps/api/src/middlewares/error-handlers.ts
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError, ApiErrorEnvelope, ApiErrorCode } from '../utils/errors.js';
import { SimulationDomainError } from '../simulation/errors.js';
import { OptimizationDomainError } from '../optimization/errors.js';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response<ApiErrorEnvelope>,
  _next: NextFunction
): void => {
  // 1. Handled App Errors (instanceof + structural duck-typing)
  const isAppError =
    err instanceof AppError ||
    (err &&
      typeof (err as unknown as { statusCode?: unknown }).statusCode === 'number' &&
      typeof (err as unknown as { code?: unknown }).code === 'string');

  if (isAppError) {
    const appErr = err as AppError;
    res.status(appErr.statusCode).json({
      error: {
        code: appErr.code,
        message: appErr.message,
        details: appErr.details || {},
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
  const isSimError =
    err instanceof SimulationDomainError ||
    (err && (err as SimulationDomainError).code === 'INFEASIBLE_EFFICIENCY_CONFIGURATION');

  if (isSimError) {
    const simErr = err as SimulationDomainError;
    res.status(400).json({
      error: {
        code: simErr.code as ApiErrorCode,
        message: simErr.message,
        details: simErr.details || {},
      },
    });
    return;
  }

  // 4. Optimization Domain Errors
  const isOptError =
    err instanceof OptimizationDomainError ||
    (err && (err as OptimizationDomainError).code === 'NO_FEASIBLE_SCENARIO');

  if (isOptError) {
    const optErr = err as OptimizationDomainError;
    const statusCode = optErr.code === 'NO_FEASIBLE_SCENARIO' ? 422 : 400;

    res.status(statusCode).json({
      error: {
        code: optErr.code as ApiErrorCode,
        message: optErr.message,
        details: optErr.details || {},
      },
    });
    return;
  }

  // 5. Unhandled Server Errors
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected internal error occurred.',
      details: {},
    },
  });
};