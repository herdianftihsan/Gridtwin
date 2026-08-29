// apps/web/src/types/api.ts

export type ApiErrorCode =
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

export interface ApiSuccessResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
  };
}

export interface ApiErrorResponse {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface SimulationConfiguration {
  pv_kwp: number;
  battery_kwh: number;
  ac_units: number;
  led_upgraded: boolean;
}

export interface SimulationBaseline {
  monthly_cost: number;
  monthly_kwh: number;
}

export interface SimulationEnergy {
  monthly_demand_kwh: number;
  solar_yield_monthly: number;
  grid_import_monthly: number;
  wasted_surplus_monthly: number;
}

export interface SimulationFinancial {
  capex: number;
  new_monthly_cost: number;
  monthly_savings: number;
  payback_years: number | null;
}

export interface SimulationEnvironmental {
  co2_reduction_kg_yr: number;
  co2_reduction_pct: number;
}

export interface SimulationGrid {
  independence_pct: number;
}

export interface SimulationAssumptions {
  tariff: number;
  psh: number;
  performance_ratio: number;
  battery_charge_efficiency: number;
  battery_discharge_efficiency: number;
  source_version: string;
}

export interface SimulationResult {
  configuration: SimulationConfiguration;
  baseline: SimulationBaseline;
  energy: SimulationEnergy;
  financial: SimulationFinancial;
  environmental: SimulationEnvironmental;
  grid: SimulationGrid;
  assumptions: SimulationAssumptions;
}

export interface Project {
  id: string;
  user_id?: string;
  building_type: 'Ruko' | 'Residential' | 'Office';
  location: string;
  roof_area?: number | null;
  monthly_bill: number;
  budget: number;
  objective: 'save_money' | 'reduce_co2' | 'independence';
  created_at?: string;
  updated_at?: string;
}

export interface Scenario {
  id: string;
  project_id?: string;
  name?: string;
  scenario_type: 'recommended' | 'custom' | 'what_if';
  is_recommended: boolean;
  solar_kwp: number;
  battery_kwh: number;
  ac_units: number;
  is_led_upgraded: boolean;
  simulation_result?: SimulationResult;
  what_if_query?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectDetailResponse {
  project: Project;
  recommended_scenario: (Scenario & { simulation_result: SimulationResult }) | null;
  recent_scenarios: Array<Scenario & { simulation_result: SimulationResult }>;
}