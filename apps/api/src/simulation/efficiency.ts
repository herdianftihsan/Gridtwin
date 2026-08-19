import { DEFAULT_ASSUMPTIONS } from './constants.js';
import { InfeasibleEfficiencyConfigurationError } from './errors.js';
import { EfficiencyResult } from './types.js';

export const calculateEfficiency = (
  acUnits: number,
  isLedUpgraded: boolean,
  baselineMonthlyKwh: number
): EfficiencyResult => {
  const estimatedAcLoad =
    acUnits *
    DEFAULT_ASSUMPTIONS.AC_OPERATING_HOURS *
    DEFAULT_ASSUMPTIONS.DAYS_IN_MONTH *
    DEFAULT_ASSUMPTIONS.AC_STANDARD_CONSUMPTION;

  const acSaving = estimatedAcLoad * DEFAULT_ASSUMPTIONS.AC_REDUCTION_FACTOR;

  const estimatedLightingLoad = DEFAULT_ASSUMPTIONS.BASELINE_LIGHTING_MONTHLY;
  const ledSaving = isLedUpgraded
    ? estimatedLightingLoad * DEFAULT_ASSUMPTIONS.LED_REDUCTION_FACTOR
    : 0;

  const totalEfficiencySaving = acSaving + ledSaving;

  // Invariant Enforcement: Total savings must not exceed baseline demand
  if (totalEfficiencySaving > baselineMonthlyKwh) {
    throw new InfeasibleEfficiencyConfigurationError(
      'AC and LED efficiency savings exceed baseline demand.',
      {
        baselineMonthlyKwh,
        totalEfficiencySaving,
        acSaving,
        ledSaving,
      }
    );
  }

  const monthlyDemandPostEfficiency = Math.max(
    0,
    baselineMonthlyKwh - totalEfficiencySaving
  );

  return {
    ac_saving_monthly: acSaving,
    led_saving_monthly: ledSaving,
    total_efficiency_saving_monthly: totalEfficiencySaving,
    monthly_demand_post_efficiency: monthlyDemandPostEfficiency,
  };
};