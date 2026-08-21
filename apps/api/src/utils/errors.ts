export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INFEASIBLE_EFFICIENCY_CONFIGURATION'
  | 'PV_CONSTRAINT_EXCEEDED'
  | 'INVALID_SIMULATION_INPUT'
  | 'NO_FEASIBLE_SCENARIO'
  | 'AI_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR';

export interface ApiErrorEnvelope {
  error: {
    code: ApiErrorCode;
    message: string;
    details: Record<string, unknown>;
  };
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ApiErrorCode;
  public readonly details: Record<string, unknown>;

  constructor(
    statusCode: number,
    code: ApiErrorCode,
    message: string,
    details: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details: Record<string, unknown> = {}) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access', details: Record<string, unknown> = {}) {
    super(401, 'UNAUTHORIZED', message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden', details: Record<string, unknown> = {}) {
    super(403, 'FORBIDDEN', message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details: Record<string, unknown> = {}) {
    super(404, 'NOT_FOUND', message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details: Record<string, unknown> = {}) {
    super(409, 'CONFLICT', message, details);
  }
}

export class RateLimitError extends AppError {
  constructor(
    message = 'Too many AI requests. Please wait a moment before trying again.',
    details: Record<string, unknown> = {}
  ) {
    super(429, 'RATE_LIMIT_EXCEEDED', message, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'An unexpected internal error occurred', details: Record<string, unknown> = {}) {
    super(500, 'INTERNAL_ERROR', message, details);
  }
}