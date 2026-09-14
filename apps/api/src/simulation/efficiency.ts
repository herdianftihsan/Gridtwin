import { DEFAULT_ASSUMPTIONS } from './constants.js';
import { InfeasibleEfficiencyConfigurationError } from './errors.js';
import { EfficiencyResult } from './types.js';

export const calculateEfficiency = (
  acUnits: number,
  isLedUpgraded: boolean,
  refrigeratorUnits: number,
  isWaterPumpUpgraded: boolean,
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

  const estimatedFridgeLoad =
    refrigeratorUnits *
    DEFAULT_ASSUMPTIONS.REFRIGERATOR_OPERATING_HOURS *
    DEFAULT_ASSUMPTIONS.DAYS_IN_MONTH *
    DEFAULT_ASSUMPTIONS.REFRIGERATOR_STANDARD_CONSUMPTION;
    
  const fridgeSaving = estimatedFridgeLoad * DEFAULT_ASSUMPTIONS.REFRIGERATOR_REDUCTION_FACTOR;

  const estimatedPumpLoad = DEFAULT_ASSUMPTIONS.BASELINE_PUMP_MONTHLY;
  const pumpSaving = isWaterPumpUpgraded
    ? estimatedPumpLoad * DEFAULT_ASSUMPTIONS.PUMP_REDUCTION_FACTOR
    : 0;

  const totalEfficiencySaving = acSaving + ledSaving + fridgeSaving + pumpSaving;

  // Invariant Enforcement: Total savings must not exceed baseline demand
  if (totalEfficiencySaving > baselineMonthlyKwh) {
    throw new InfeasibleEfficiencyConfigurationError(
      'Efficiency savings exceed baseline demand.',
      {
        baselineMonthlyKwh,
        totalEfficiencySaving,
        acSaving,
        ledSaving,
        fridgeSaving,
        pumpSaving,
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
    refrigerator_saving_monthly: fridgeSaving,
    pump_saving_monthly: pumpSaving,
    total_efficiency_saving_monthly: totalEfficiencySaving,
    monthly_demand_post_efficiency: monthlyDemandPostEfficiency,
  };
};