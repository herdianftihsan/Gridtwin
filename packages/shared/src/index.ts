/**
 * @gridtwin/shared — shared contract layer between apps/api and apps/web.
 *
 * Phase 1 scaffold: contracts only, no business logic.
 * Every contract added here must trace back to an authoritative
 * GridTwin specification (maintained outside this repository).
 */

/**
 * Standard error codes — api-contract.md v1.0.2, section 4.
 */
export const API_ERROR_CODES = [
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "INFEASIBLE_EFFICIENCY_CONFIGURATION",
  "NO_FEASIBLE_SCENARIO",
  "SIMULATION_ERROR",
  "AI_ERROR",
  "INTERNAL_ERROR",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];
