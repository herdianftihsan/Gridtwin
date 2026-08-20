// apps/api/src/mappers/simulation.mapper.ts
import { SimulationResult } from '../simulation/types.js';

export interface DatabaseScenarioRow {
  id: string;
  project_id: string;
  scenario_type: 'baseline' | 'recommended' | 'custom' | 'what_if';
  name: string | null;
  solar_kwp: number;
  battery_kwh: number;
  ac_units: number;
  is_led_upgraded: boolean;
  is_recommended: boolean;
  what_if_query: string | null;
  ai_explanation: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSimulationResultRow {
  id: string;
  scenario_id: string;
  baseline_monthly_cost: number;
  baseline_monthly_kwh: number;
  monthly_demand_kwh: number;
  solar_yield_monthly: number;
  grid_import_monthly: number;
  wasted_surplus_monthly: number;
  capex: number;
  new_monthly_cost: number;
  monthly_savings: number;
  payback_years: number | null;
  co2_reduction_kg_yr: number;
  co2_reduction_pct: number;
  independence_pct: number;
  assumptions: Record<string, unknown>;
  model_version: string;
  created_at: string;
}

export const toSimulationResultContract = (
  scenario: DatabaseScenarioRow,
  simResult: DatabaseSimulationResultRow
): SimulationResult => {
  return {
    configuration: {
      pv_kwp: Number(scenario.solar_kwp),
      battery_kwh: Number(scenario.battery_kwh),
      ac_units: Number(scenario.ac_units),
      led_upgraded: Boolean(scenario.is_led_upgraded),
    },
    baseline: {
      monthly_cost: Number(simResult.baseline_monthly_cost),
      monthly_kwh: Number(simResult.baseline_monthly_kwh),
    },
    energy: {
      monthly_demand_kwh: Number(simResult.monthly_demand_kwh),
      solar_yield_monthly: Number(simResult.solar_yield_monthly),
      grid_import_monthly: Number(simResult.grid_import_monthly),
      wasted_surplus_monthly: Number(simResult.wasted_surplus_monthly),
    },
    financial: {
      capex: Number(simResult.capex),
      new_monthly_cost: Number(simResult.new_monthly_cost),
      monthly_savings: Number(simResult.monthly_savings),
      payback_years: simResult.payback_years !== null ? Number(simResult.payback_years) : null,
    },
    environmental: {
      co2_reduction_kg_yr: Number(simResult.co2_reduction_kg_yr),
      co2_reduction_pct: Number(simResult.co2_reduction_pct),
    },
    grid: {
      independence_pct: Number(simResult.independence_pct),
    },
    assumptions: {
      tariff: Number(simResult.assumptions.tariff ?? 1500),
      psh: Number(simResult.assumptions.psh ?? 4.5),
      performance_ratio: Number(simResult.assumptions.performance_ratio ?? 0.75),
      battery_charge_efficiency: Number(simResult.assumptions.battery_charge_efficiency ?? 0.95),
      battery_discharge_efficiency: Number(simResult.assumptions.battery_discharge_efficiency ?? 0.95),
      source_version: String(simResult.assumptions.source_version ?? 'mvp-1.0'),
    },
  };
};

export const toDatabaseSimulationResultPayload = (
  scenarioId: string,
  result: SimulationResult
): Omit<DatabaseSimulationResultRow, 'id' | 'created_at'> => {
  return {
    scenario_id: scenarioId,
    baseline_monthly_cost: result.baseline.monthly_cost,
    baseline_monthly_kwh: result.baseline.monthly_kwh,
    monthly_demand_kwh: result.energy.monthly_demand_kwh,
    solar_yield_monthly: result.energy.solar_yield_monthly,
    grid_import_monthly: result.energy.grid_import_monthly,
    wasted_surplus_monthly: result.energy.wasted_surplus_monthly,
    capex: result.financial.capex,
    new_monthly_cost: result.financial.new_monthly_cost,
    monthly_savings: result.financial.monthly_savings,
    payback_years: result.financial.payback_years,
    co2_reduction_kg_yr: result.environmental.co2_reduction_kg_yr,
    co2_reduction_pct: result.environmental.co2_reduction_pct,
    independence_pct: result.grid.independence_pct,
    assumptions: result.assumptions as unknown as Record<string, unknown>,
    model_version: 'mvp-1.0.7',
  };
};