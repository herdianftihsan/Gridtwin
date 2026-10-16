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

/**
 * Shareable Decision Brief Snapshot
 * Immutable, privacy-sanitized snapshot of a project's decision summary
 */
export interface DecisionBriefSnapshot {
  project: {
    building_type: 'Ruko' | 'Residential' | 'Office';
    location: string;
  };
  scenario: {
    name: string;
    is_recommended: boolean;
    scenario_type: 'baseline' | 'recommended' | 'custom' | 'what_if';
  };
  configuration: {
    pv_kwp: number;
    battery_kwh: number;
    ac_units: number;
    led_upgraded: boolean;
    refrigerator_units: number;
    water_pump_upgraded: boolean;
  };
  baseline: {
    monthly_cost: number;
    monthly_kwh: number;
  };
  financial: {
    capex: number;
    new_monthly_cost: number;
    monthly_savings: number;
    annual_savings: number;
    payback_years: number | null;
    estimated_roi_10yr_pct: number | null;
  };
  environmental: {
    co2_reduction_kg_yr: number;
    co2_reduction_pct: number;
  };
  grid: {
    independence_pct: number;
  };
  assumptions: {
    tariff: number;
    psh: number;
    performance_ratio: number;
    battery_charge_efficiency: number;
    battery_discharge_efficiency: number;
    source_version: string;
    optimization_objective?: string;
  };
  disclaimer: string;
  generated_at: string;
}

export interface PublicDecisionShareResponse {
  snapshot: DecisionBriefSnapshot;
  created_at: string;
  expires_at: string;
}

export interface CreateDecisionShareResponse {
  id: string;
  share_token: string;
  share_url: string;
  expires_at: string;
  created_at: string;
}

export interface ActiveShareSummary {
  id: string;
  expires_at: string;
  created_at: string;
  is_active: boolean;
}
