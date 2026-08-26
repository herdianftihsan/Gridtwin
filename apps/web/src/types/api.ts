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
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR';

export interface ApiSuccessResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiErrorResponse {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface Project {
  id: string;
  user_id: string;
  building_type: 'Ruko' | 'Residential' | 'Office';
  location: string;
  roof_area: number | null;
  monthly_bill: number;
  budget: number;
  objective: 'save_money' | 'reduce_co2' | 'independence';
  created_at: string;
  updated_at: string;
}

export interface SimulationResultContract {
  configuration: {
    pv_kwp: number;
    battery_kwh: number;
    ac_units: number;
    led_upgraded: boolean;
  };
  baseline: {
    monthly_cost: number;
    monthly_kwh: number;
  };
  energy: {
    monthly_demand_kwh: number;
    solar_yield_monthly: number;
    grid_import_monthly: number;
    wasted_surplus_monthly: number;
  };
  financial: {
    capex: number;
    new_monthly_cost: number;
    monthly_savings: number;
    payback_years: number;
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
  };
}

export interface Scenario {
  id: string;
  scenario_type: 'baseline' | 'recommended' | 'custom' | 'what_if';
  is_recommended?: boolean;
  solar_kwp: number;
  battery_kwh: number;
  ac_units: number;
  is_led_upgraded: boolean;
  what_if_query?: string | null;
  ai_explanation?: string | null;
  created_at?: string;
  simulation_result: SimulationResultContract;
}

export interface ProjectDetailPayload {
  project: Project;
  recommended_scenario: Scenario | null;
  recent_scenarios: Scenario[];
}