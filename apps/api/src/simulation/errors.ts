import { ApiErrorCode } from '../utils/errors.js';

export abstract class SimulationDomainError extends Error {
  public abstract readonly code: ApiErrorCode;
  public readonly details: Readonly<Record<string, unknown>>;

  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = this.constructor.name;
    this.details = Object.freeze({ ...details });
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InfeasibleEfficiencyConfigurationError extends SimulationDomainError {
  public readonly code: ApiErrorCode = 'INFEASIBLE_EFFICIENCY_CONFIGURATION';

  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message, details);
  }
}

export class PvConstraintExceededError extends SimulationDomainError {
  public readonly code: ApiErrorCode = 'PV_CONSTRAINT_EXCEEDED';

  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message, details);
  }
}

export class InvalidSimulationInputError extends SimulationDomainError {
  public readonly code: ApiErrorCode = 'INVALID_SIMULATION_INPUT';

  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message, details);
  }
}