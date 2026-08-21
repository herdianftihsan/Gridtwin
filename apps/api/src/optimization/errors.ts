import { ApiErrorCode } from '../utils/errors.js';

export abstract class OptimizationDomainError extends Error {
  public abstract readonly code: ApiErrorCode;
  public readonly details: Readonly<Record<string, unknown>>;

  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = this.constructor.name;
    this.details = Object.freeze({ ...details });
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NoFeasibleScenarioDomainError extends OptimizationDomainError {
  public readonly code: ApiErrorCode = 'NO_FEASIBLE_SCENARIO';

  constructor(
    message = 'Budget terlalu rendah untuk konfigurasi sistem yang tersedia.',
    details: Record<string, unknown> = {}
  ) {
    super(message, details);
  }
}