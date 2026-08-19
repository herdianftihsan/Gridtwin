import { DEFAULT_ASSUMPTIONS } from './constants.js';
import { FinancialResult, SimulationConfig } from './types.js';

export const calculateFinancials = (
  config: SimulationConfig,
  gridImportMonthly: number,
  baselineMonthlyBill: number,
  tariff: number = DEFAULT_ASSUMPTIONS.GRID_TARIFF
): FinancialResult => {
  const capex =
    config.solar_kwp * DEFAULT_ASSUMPTIONS.SOLAR_CAPEX_PER_KWP +
    config.battery_kwh * DEFAULT_ASSUMPTIONS.BATTERY_CAPEX_PER_KWH +
    config.ac_units * DEFAULT_ASSUMPTIONS.AC_CAPEX_PER_UNIT +
    (config.is_led_upgraded ? DEFAULT_ASSUMPTIONS.LED_CAPEX_PER_LOT : 0);

  const newMonthlyCost = gridImportMonthly * tariff;
  const monthlySavings = baselineMonthlyBill - newMonthlyCost;
  const annualSavings = monthlySavings * 12;

  // Simple payback bernilai null jika penghematan tahunan <= 0
  const paybackYears = annualSavings > 0 ? capex / annualSavings : null;

  return {
    capex,
    new_monthly_cost: newMonthlyCost,
    monthly_savings: monthlySavings,
    annual_savings: annualSavings,
    payback_years: paybackYears,
  };
};