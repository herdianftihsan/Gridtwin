import { DEFAULT_ASSUMPTIONS, lookupPsh } from './constants.js';
import { InvalidSimulationInputError, PvConstraintExceededError } from './errors.js';
import { calculateBaseline } from './baseline.js';
import { calculateEfficiency } from './efficiency.js';
import { calculateRepresentativeDay } from './load-profile.js';
import { calculatePvConstraints, calculateSolarGeneration } from './solar.js';
import { calculateBatteryDispatch } from './battery.js';
import { calculateGridBalance } from './grid.js';
import { calculateFinancials } from './financial.js';
import { calculateEmissions, calculateGridIndependence } from './emissions.js';
import {
  ResolvedAssumptions,
  SimulationConfig,
  SimulationContext,
  SimulationResult,
} from './types.js';

/**
 * Pure O(1) deterministic decimal rounder resistant to IEEE-754 binary floating noise.
 */
const roundToDecimals = (val: number, decimals: number): number => {
  const factor = 10 ** decimals;
  const sign = val < 0 ? -1 : 1;
  const absVal = Math.abs(val);
  return (sign * Math.round(absVal * factor + 1e-9)) / factor;
};

const roundCurrency = (val: number): number => Math.round(val);
const roundKwh = (val: number): number => roundToDecimals(val, 2);
const roundPct = (val: number): number => roundToDecimals(val, 1);
const roundPayback = (val: number | null): number | null =>
  val !== null ? roundToDecimals(val, 1) : null;

export const simulate = (
  config: SimulationConfig,
  context: SimulationContext
): SimulationResult => {
  // 1. Boundary & Input Validation
  if (context.monthly_bill <= 0) {
    throw new InvalidSimulationInputError('Monthly bill must be greater than 0.');
  }

  if (
    config.solar_kwp < 0 ||
    config.battery_kwh < 0 ||
    config.ac_units < 0
  ) {
    throw new InvalidSimulationInputError('Asset configurations cannot be negative.');
  }

  const { maxPvAllowed } = calculatePvConstraints(context.roof_area);
  if (config.solar_kwp > maxPvAllowed) {
    throw new PvConstraintExceededError(
      `Solar capacity (${config.solar_kwp} kWp) exceeds roof limit (${maxPvAllowed} kWp).`,
      {
        solarKwp: config.solar_kwp,
        maxPvAllowed,
        roofArea: context.roof_area,
      }
    );
  }

  // 2. Resolve Assumptions
  const resolvedPsh =
    context.assumptions?.psh ?? lookupPsh(context.location);

  const assumptions: ResolvedAssumptions = {
    tariff: context.assumptions?.tariff ?? DEFAULT_ASSUMPTIONS.GRID_TARIFF,
    psh: resolvedPsh,
    performance_ratio:
      context.assumptions?.performance_ratio ??
      DEFAULT_ASSUMPTIONS.PERFORMANCE_RATIO,
    battery_charge_efficiency:
      context.assumptions?.battery_charge_efficiency ??
      DEFAULT_ASSUMPTIONS.BATTERY_CHARGE_EFFICIENCY,
    battery_discharge_efficiency:
      context.assumptions?.battery_discharge_efficiency ??
      DEFAULT_ASSUMPTIONS.BATTERY_DISCHARGE_EFFICIENCY,
    emission_factor:
      context.assumptions?.emission_factor ??
      DEFAULT_ASSUMPTIONS.EMISSION_FACTOR,
    source_version:
      context.assumptions?.source_version ??
      DEFAULT_ASSUMPTIONS.SOURCE_VERSION,
  };

  // 3. Baseline Model
  const baseline = calculateBaseline(
    context.monthly_bill,
    assumptions.tariff,
    assumptions.emission_factor
  );

  // 4. Efficiency Upgrades & Invariant Check
  const efficiency = calculateEfficiency(
    config.ac_units,
    config.is_led_upgraded,
    baseline.monthly_kwh
  );

  // 5. Representative Day Load Profile
  const loadProfile = calculateRepresentativeDay(
    efficiency.monthly_demand_post_efficiency,
    DEFAULT_ASSUMPTIONS.DAYS_IN_MONTH
  );

  // 6. Solar PV Generation
  const solar = calculateSolarGeneration(
    config.solar_kwp,
    assumptions.psh,
    assumptions.performance_ratio,
    DEFAULT_ASSUMPTIONS.DAYS_IN_MONTH
  );

  // 7. Battery Dispatch & Self-Consumption
  const batteryDispatch = calculateBatteryDispatch(
    solar.solar_daily,
    loadProfile.day_load,
    loadProfile.night_load,
    config.battery_kwh,
    assumptions.battery_charge_efficiency,
    assumptions.battery_discharge_efficiency
  );

  // 8. Grid Balance
  const gridBalance = calculateGridBalance(
    loadProfile.day_load,
    batteryDispatch.self_consumption_daily,
    loadProfile.night_load,
    batteryDispatch.battery_energy_discharged,
    batteryDispatch.wasted_surplus_daily,
    DEFAULT_ASSUMPTIONS.DAYS_IN_MONTH
  );

  // 9. Financial Model
  const financials = calculateFinancials(
    config,
    gridBalance.grid_import_monthly,
    baseline.monthly_cost,
    assumptions.tariff
  );

  // 10. Emissions Model
  const emissions = calculateEmissions(
    baseline.monthly_kwh,
    gridBalance.grid_import_monthly,
    assumptions.emission_factor
  );

  // 11. Grid Independence
  const independence = calculateGridIndependence(
    gridBalance.grid_import_monthly,
    efficiency.monthly_demand_post_efficiency
  );

  // 12. Final SimulationResult Envelope
  return {
    configuration: {
      pv_kwp: config.solar_kwp,
      battery_kwh: config.battery_kwh,
      ac_units: config.ac_units,
      led_upgraded: config.is_led_upgraded,
    },
    baseline: {
      monthly_cost: roundCurrency(baseline.monthly_cost),
      monthly_kwh: roundKwh(baseline.monthly_kwh),
    },
    energy: {
      monthly_demand_kwh: roundKwh(efficiency.monthly_demand_post_efficiency),
      solar_yield_monthly: roundKwh(solar.yield_monthly),
      grid_import_monthly: roundKwh(gridBalance.grid_import_monthly),
      wasted_surplus_monthly: roundKwh(gridBalance.wasted_surplus_monthly),
    },
    financial: {
      capex: roundCurrency(financials.capex),
      new_monthly_cost: roundCurrency(financials.new_monthly_cost),
      monthly_savings: roundCurrency(financials.monthly_savings),
      payback_years: roundPayback(financials.payback_years),
    },
    environmental: {
      co2_reduction_kg_yr: roundKwh(emissions.co2_reduction_kg_yr),
      co2_reduction_pct: roundPct(emissions.co2_reduction_pct),
    },
    grid: {
      independence_pct: roundPct(independence.independence_pct),
    },
    assumptions: {
      tariff: assumptions.tariff,
      psh: assumptions.psh,
      performance_ratio: assumptions.performance_ratio,
      battery_charge_efficiency: assumptions.battery_charge_efficiency,
      battery_discharge_efficiency: assumptions.battery_discharge_efficiency,
      source_version: assumptions.source_version,
    },
  };
};