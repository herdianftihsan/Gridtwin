export type StandardErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INFEASIBLE_EFFICIENCY_CONFIGURATION'
  | 'NO_FEASIBLE_SCENARIO'
  | 'SIMULATION_ERROR'
  | 'AI_ERROR'
  | 'INTERNAL_ERROR';

// Interface envelope error sesuai API Contract v1.0.2
export interface ApiErrorEnvelope {
  error: {
    code: StandardErrorCode | string;
    message: string;
    details: Record<string, unknown>;
  };
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: StandardErrorCode;
  public readonly details: Record<string, unknown>;

  constructor(
    statusCode: number,
    code: StandardErrorCode,
    message: string,
    details: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'AppError';
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
  constructor(message = 'Authentication token is required and must be valid') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to access this project') {
    super(403, 'FORBIDDEN', message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'The requested resource was not found') {
    super(404, 'NOT_FOUND', message);
  }
}

export class InfeasibleEfficiencyError extends AppError {
  constructor(message = 'AC and LED efficiency savings exceed baseline demand.') {
    super(400, 'INFEASIBLE_EFFICIENCY_CONFIGURATION', message);
  }
}

export class NoFeasibleScenarioError extends AppError {
  constructor(
    message = 'Budget terlalu rendah untuk konfigurasi sistem yang tersedia.',
    details: Record<string, unknown> = {}
  ) {
    super(422, 'NO_FEASIBLE_SCENARIO', message, details);
  }
}

export class SimulationError extends AppError {
  constructor(message = 'Simulation calculation failed', details: Record<string, unknown> = {}) {
    super(500, 'SIMULATION_ERROR', message, details);
  }
}

export class AiError extends AppError {
  constructor(message = 'AI generation upstream error', details: Record<string, unknown> = {}) {
    super(502, 'AI_ERROR', message, details);
  }
}

export class InternalError extends AppError {
  constructor(message = 'An unexpected internal error occurred') {
    super(500, 'INTERNAL_ERROR', message);
  }
}