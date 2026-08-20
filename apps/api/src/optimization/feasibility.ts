import { DEFAULT_ASSUMPTIONS } from '../simulation/constants.js';
import { calculatePvConstraints } from '../simulation/solar.js';
import { SimulationConfig, SimulationContext } from '../simulation/types.js';

export const isBaseline = (config: SimulationConfig): boolean => {
  return (
    config.solar_kwp === 0 &&
    config.battery_kwh === 0 &&
    config.ac_units === 0 &&
    !config.is_led_upgraded
  );
};

export const calculateCandidateCapex = (config: SimulationConfig): number => {
  return (
    config.solar_kwp * DEFAULT_ASSUMPTIONS.SOLAR_CAPEX_PER_KWP +
    config.battery_kwh * DEFAULT_ASSUMPTIONS.BATTERY_CAPEX_PER_KWH +
    config.ac_units * DEFAULT_ASSUMPTIONS.AC_CAPEX_PER_UNIT +
    (config.is_led_upgraded ? DEFAULT_ASSUMPTIONS.LED_CAPEX_PER_LOT : 0)
  );
};

export const filterFeasibleCandidates = (
  candidates: readonly SimulationConfig[],
  context: SimulationContext
): SimulationConfig[] => {
  const { maxPvAllowed } = calculatePvConstraints(context.roof_area);
  const tariff = context.assumptions?.tariff ?? DEFAULT_ASSUMPTIONS.GRID_TARIFF;
  const baselineMonthlyKwh = context.monthly_bill / tariff;

  return candidates.filter((candidate) => {
    // 1. Exclude baseline configuration
    if (isBaseline(candidate)) {
      return false;
    }

    // 2. Physical roof constraint
    if (candidate.solar_kwp > maxPvAllowed) {
      return false;
    }

    // 3. Investment budget constraint
    const capex = calculateCandidateCapex(candidate);
    if (capex > context.budget) {
      return false;
    }

    // 4. Efficiency invariant enforcement (INFEASIBLE_EFFICIENCY_CONFIGURATION check)
    const estimatedAcLoad =
      candidate.ac_units *
      DEFAULT_ASSUMPTIONS.AC_OPERATING_HOURS *
      DEFAULT_ASSUMPTIONS.DAYS_IN_MONTH *
      DEFAULT_ASSUMPTIONS.AC_STANDARD_CONSUMPTION;
    const acSaving = estimatedAcLoad * DEFAULT_ASSUMPTIONS.AC_REDUCTION_FACTOR;
    const ledSaving = candidate.is_led_upgraded
      ? DEFAULT_ASSUMPTIONS.BASELINE_LIGHTING_MONTHLY *
        DEFAULT_ASSUMPTIONS.LED_REDUCTION_FACTOR
      : 0;

    if (acSaving + ledSaving > baselineMonthlyKwh) {
      return false;
    }

    return true;
  });
};