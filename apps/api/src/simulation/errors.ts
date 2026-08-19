export abstract class SimulationDomainError extends Error {
  public abstract readonly code: string;
  public readonly details: Readonly<Record<string, unknown>>;

  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = this.constructor.name;
    this.details = Object.freeze({ ...details });
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InfeasibleEfficiencyConfigurationError extends SimulationDomainError {
  public readonly code = 'INFEASIBLE_EFFICIENCY_CONFIGURATION';

  constructor(
    message = 'AC and LED efficiency savings exceed baseline demand.',
    details: Record<string, unknown> = {}
  ) {
    super(message, details);
  }
}

export class PvConstraintExceededError extends SimulationDomainError {
  public readonly code = 'PV_CONSTRAINT_EXCEEDED';

  constructor(
    message = 'Solar PV capacity exceeds physical roof area limit.',
    details: Record<string, unknown> = {}
  ) {
    super(message, details);
  }
}

export class InvalidSimulationInputError extends SimulationDomainError {
  public readonly code = 'INVALID_SIMULATION_INPUT';

  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message, details);
  }
}