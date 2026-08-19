export interface SimulationConfig {
  readonly solar_kwp: number;
  readonly battery_kwh: number;
  readonly ac_units: number;
  readonly is_led_upgraded: boolean;
}

export interface SimulationContext {
  readonly building_type: 'Ruko' | 'Residential' | 'Office';
  readonly location: string;
  readonly roof_area: number | null;
  readonly monthly_bill: number;
  readonly budget: number;
  readonly objective: 'save_money' | 'reduce_co2' | 'independence';
  readonly assumptions?: Partial<{
    tariff: number;
    psh: number;
    performance_ratio: number;
    battery_charge_efficiency: number;
    battery_discharge_efficiency: number;
    emission_factor: number;
    source_version: string;
  }>;
}

export interface ResolvedAssumptions {
  readonly tariff: number;
  readonly psh: number;
  readonly performance_ratio: number;
  readonly battery_charge_efficiency: number;
  readonly battery_discharge_efficiency: number;
  readonly emission_factor: number;
  readonly source_version: string;
}

export interface BaselineModelResult {
  readonly monthly_cost: number;
  readonly monthly_kwh: number;
  readonly annual_cost: number;
  readonly baseline_co2_kg: number;
}

export interface EfficiencyResult {
  readonly ac_saving_monthly: number;
  readonly led_saving_monthly: number;
  readonly total_efficiency_saving_monthly: number;
  readonly monthly_demand_post_efficiency: number;
}

export interface RepresentativeDayLoad {
  readonly daily_demand: number;
  readonly day_load: number;
  readonly night_load: number;
}

export interface SolarGenerationResult {
  readonly yield_monthly: number;
  readonly solar_daily: number;
}

export interface BatteryDispatchResult {
  readonly self_consumption_daily: number;
  readonly solar_surplus_available: number;
  readonly battery_energy_sent: number;
  readonly battery_energy_stored: number;
  readonly battery_energy_discharged: number;
  readonly wasted_surplus_daily: number;
  readonly remaining_grid_import_night: number;
}

export interface GridBalanceResult {
  readonly grid_import_daily: number;
  readonly grid_import_monthly: number;
  readonly wasted_surplus_monthly: number;
}

export interface FinancialResult {
  readonly capex: number;
  readonly new_monthly_cost: number;
  readonly monthly_savings: number;
  readonly annual_savings: number;
  readonly payback_years: number | null;
}

export interface EnvironmentalResult {
  readonly co2_reduction_kg_yr: number;
  readonly co2_reduction_pct: number;
}

export interface GridIndependenceResult {
  readonly independence_pct: number;
}

export interface SimulationResult {
  readonly configuration: {
    readonly pv_kwp: number;
    readonly battery_kwh: number;
    readonly ac_units: number;
    readonly led_upgraded: boolean;
  };
  readonly baseline: {
    readonly monthly_cost: number;
    readonly monthly_kwh: number;
  };
  readonly energy: {
    readonly monthly_demand_kwh: number;
    readonly solar_yield_monthly: number;
    readonly grid_import_monthly: number;
    readonly wasted_surplus_monthly: number;
  };
  readonly financial: {
    readonly capex: number;
    readonly new_monthly_cost: number;
    readonly monthly_savings: number;
    readonly payback_years: number | null;
  };
  readonly environmental: {
    readonly co2_reduction_kg_yr: number;
    readonly co2_reduction_pct: number;
  };
  readonly grid: {
    readonly independence_pct: number;
  };
  readonly assumptions: {
    readonly tariff: number;
    readonly psh: number;
    readonly performance_ratio: number;
    readonly battery_charge_efficiency: number;
    readonly battery_discharge_efficiency: number;
    readonly source_version: string;
  };
}